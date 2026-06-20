import { MockRuntime as UIRuntime } from "@express-addon-tests/ui-sdk-mock";
import { BridgeTimeoutError } from "./errors.js";

/**
 * Type representing an exposed API object over the bridge.
 */
export type BridgeApi = Record<string, (...args: unknown[]) => unknown>;

/**
 * The document sandbox runtime representation within the test bridge.
 */
export class SandboxRuntime {
    public readonly type = "documentSandbox";
    private _exposedApi: BridgeApi | null = null;
    private _bridge: { getProxyFor: (runtimeType: string) => Promise<BridgeApi> } | null = null;
    private _onExpose: ((api: BridgeApi) => void) | null = null;

    constructor(onExpose?: (api: BridgeApi) => void) {
        if (onExpose) {
            this._onExpose = onExpose;
        }
    }

    /**
     * Exposes an API object from the document sandbox to the UI iframe.
     * @param api The API object to expose.
     */
    exposeApi(api: BridgeApi): void {
        this._exposedApi = api;
        if (this._onExpose) {
            this._onExpose(api);
        }
    }

    /**
     * Creates a proxy to an API exposed by another runtime.
     * @param runtimeType The runtime type exposing the API (e.g., 'panel').
     * @returns A promise resolving to the proxied API.
     */
    async apiProxy(runtimeType: string): Promise<BridgeApi> {
        if (!this._bridge) {
            throw new Error("Bridge not initialized.");
        }
        return this._bridge.getProxyFor(runtimeType);
    }

    /** Internal method to set the bridge link. */
    __setBridge(bridge: { getProxyFor: (runtimeType: string) => Promise<BridgeApi> }): void {
        this._bridge = bridge;
    }
}

/**
 * Creates a mock RPC bridge that connects the UI Iframe runtime and the Document Sandbox runtime.
 * This simulates the Comlink asynchronous RPC protocol across the iframe boundary.
 * 
 * @param options Configuration options for the bridge.
 * @param options.timeout Timeout in milliseconds to wait for a runtime to expose its API (default: 5000ms).
 * @returns An object containing the `iframeRuntime` (MockRuntime) and the `sandboxRuntime` (SandboxRuntime).
 */
export function createBridge(options?: { timeout?: number }): { iframeRuntime: UIRuntime; sandboxRuntime: SandboxRuntime } {
    const timeout = options?.timeout ?? 5000;

    const uiRuntime = new UIRuntime();
    
    let uiExposed: BridgeApi | null = null;
    let uiExposedResolver: (() => void) | null = null;
    const uiExposedPromise = new Promise<void>((resolve) => {
        uiExposedResolver = resolve;
    });

    let sandboxExposed: BridgeApi | null = null;
    let sandboxExposedResolver: (() => void) | null = null;
    const sandboxExposedPromise = new Promise<void>((resolve) => {
        sandboxExposedResolver = resolve;
    });

    const sandboxRuntime = new SandboxRuntime((api: BridgeApi) => {
        sandboxExposed = api;
        sandboxExposedResolver?.();
    });

    const bridge = {
        getProxyFor(runtimeType: string): Promise<BridgeApi> {
            if (runtimeType === "panel") {
                if (uiExposed) return Promise.resolve(createComlinkProxy(() => uiExposed));
                return new Promise<BridgeApi>((resolve, reject) => {
                    const timer = setTimeout(() => {
                        reject(new BridgeTimeoutError("panel"));
                    }, timeout);

                    uiExposedPromise.then(() => {
                        clearTimeout(timer);
                        resolve(createComlinkProxy(() => uiExposed));
                    });
                });
            } else if (runtimeType === "documentSandbox") {
                if (sandboxExposed) return Promise.resolve(createComlinkProxy(() => sandboxExposed));
                return new Promise<BridgeApi>((resolve, reject) => {
                    const timer = setTimeout(() => {
                        reject(new BridgeTimeoutError("documentSandbox"));
                    }, timeout);

                    sandboxExposedPromise.then(() => {
                        clearTimeout(timer);
                        resolve(createComlinkProxy(() => sandboxExposed));
                    });
                });
            }
            return Promise.reject(new Error(`Unknown runtime: ${runtimeType}`));
        }
    };

    uiRuntime.__setBridge({
        exposeApi(api: Record<string, unknown>) {
            uiExposed = api as BridgeApi;
            uiExposedResolver?.();
        },
        async apiProxy<T>(runtimeType: string): Promise<T> {
            return (await bridge.getProxyFor(runtimeType)) as unknown as T;
        }
    });

    sandboxRuntime.__setBridge(bridge);

    return {
        iframeRuntime: uiRuntime,
        sandboxRuntime: sandboxRuntime
    };
}

function getPath(obj: unknown, path: string[]): unknown {
    let curr = obj;
    for (const prop of path) {
        if (curr === null || curr === undefined) {
            throw new TypeError(`Cannot read properties of ${curr} (reading '${prop}')`);
        }
        curr = (curr as Record<string, unknown>)[prop];
    }
    return curr;
}

function createRecursiveProxy(targetGetter: () => unknown, path: string[] = []): unknown {
    const dummyTarget = () => {};
    return new Proxy(dummyTarget, {
        get(t, prop: string | symbol) {
            if (prop === "then") {
                if (path.length === 0) {
                    return undefined;
                }
                return (resolve: (val: unknown) => void, reject: (err: unknown) => void) => {
                    try {
                        const target = targetGetter();
                        if (!target) {
                            throw new Error("API not exposed yet. The target runtime has not registered its API. Make sure that you await runtime.apiProxy() and that runtime.exposeApi() is called on the other side.");
                        }
                        const val = getPath(target, path);
                        if (val && typeof (val as Record<string, unknown>).then === "function") {
                            ((val as Record<string, unknown>).then as Function)(resolve, reject);
                        } else {
                            resolve(val);
                        }
                    } catch (err) {
                        reject(err);
                    }
                };
            }
            if (typeof prop === "symbol") {
                return undefined;
            }
            return createRecursiveProxy(targetGetter, [...path, prop]);
        },
        apply(t, thisArg, argumentsList) {
            try {
                const target = targetGetter();
                if (!target) {
                    throw new Error("API not exposed yet. The target runtime has not registered its API. Make sure that you await runtime.apiProxy() and that runtime.exposeApi() is called on the other side.");
                }
                if (path.length === 0) {
                    throw new TypeError("Proxy root is not a function");
                }
                const parentPath = path.slice(0, -1);
                const lastProp = path[path.length - 1] as string;
                const parentVal = getPath(target, parentPath) as Record<string, unknown>;
                if (parentVal === null || parentVal === undefined) {
                    throw new TypeError(`Cannot read properties of ${parentVal} (reading '${lastProp}')`);
                }
                const fn = parentVal[lastProp];
                if (typeof fn !== "function") {
                    throw new TypeError(`${path.join(".")} is not a function`);
                }
                const result = fn.apply(parentVal, argumentsList);
                if (result && typeof (result as Record<string, unknown>).then === "function") {
                    return result;
                }
                return Promise.resolve(result);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    });
}

function createComlinkProxy(targetGetter: () => BridgeApi | null): BridgeApi {
    return createRecursiveProxy(targetGetter) as BridgeApi;
}
