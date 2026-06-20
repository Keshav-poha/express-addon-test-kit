import type { Runtime, RuntimeType, Dialog } from "./types.js";
import { UnknownRuntimeError } from "./errors.js";

/**
 * Type alias for an exposed API object.
 */
export type ExposedApi = Record<string, unknown>;

/**
 * Interface defining the bridge linking runtimes.
 */
export interface RuntimeBridge {
    exposeApi?: (apiObj: ExposedApi) => void;
    apiProxy?: <T>(runtimeType: RuntimeType) => Promise<T>;
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

function createComlinkProxy(targetGetter: () => Record<string, unknown>): unknown {
    return createRecursiveProxy(targetGetter);
}

/**
 * Mock implementation of the add-on Runtime interface.
 * Handles API exposure and proxying across simulated runtimes.
 */
export class MockRuntime implements Runtime {
    public readonly type: RuntimeType = "panel" as RuntimeType;
    public dialog?: Dialog;

    private _exposedApi: ExposedApi | null = null;
    private _bridge: RuntimeBridge | null = null;

    constructor(dialog?: Dialog) {
        if (dialog !== undefined) {
            this.dialog = dialog;
        }
    }

    /**
     * Exposes an API object to other runtimes.
     * @param apiObj The object to expose.
     */
    exposeApi<T>(apiObj: T): void {
        if (this._bridge?.exposeApi) {
            this._bridge.exposeApi(apiObj as unknown as ExposedApi);
        } else {
            this._exposedApi = apiObj as unknown as ExposedApi;
        }
    }

    /**
     * Creates a proxy to an API exposed by another runtime.
     * @param runtimeType The runtime type exposing the API.
     * @returns A promise resolving to the proxied API.
     */
    async apiProxy<T>(runtimeType: RuntimeType): Promise<T> {
        if (this._bridge?.apiProxy) {
            return this._bridge.apiProxy<T>(runtimeType);
        }

        if (runtimeType === this.type) {
            return createComlinkProxy(() => this._exposedApi || {}) as unknown as T;
        }

        if (runtimeType === ("documentSandbox" as RuntimeType)) {
            throw new Error("Bridge not initialized: cannot proxy to documentSandbox");
        }

        throw new UnknownRuntimeError(runtimeType);
    }

    /**
     * Internal method to connect a mock bridge implementation.
     */
    __setBridge(bridge: RuntimeBridge): void {
        this._bridge = bridge;
        if (this._exposedApi && bridge.exposeApi) {
            bridge.exposeApi(this._exposedApi);
        }
    }
}
