import { MockRuntime as UIRuntime } from "@express-addon-tests/ui-sdk-mock";
import { BridgeTimeoutError } from "./errors.js";

class SandboxRuntime {
    public readonly type = "documentSandbox";
    private _exposedApi: any = null;
    private _bridge: any = null;
    private _onExpose: (() => void) | null = null;

    exposeApi(api: any) {
        this._exposedApi = api;
        if (this._onExpose) {
            this._onExpose();
        }
    }

    async apiProxy(runtimeType: string): Promise<any> {
        return this._bridge.getProxyFor(runtimeType);
    }

    __setBridge(bridge: any) {
        this._bridge = bridge;
    }
}

export function createBridge(options?: { timeout?: number }) {
    const timeout = options?.timeout ?? 5000;

    const uiRuntime = new UIRuntime();
    const sandboxRuntime = new SandboxRuntime();

    let uiExposed: any = null;
    let uiExposedResolver: (() => void) | null = null;
    const uiExposedPromise = new Promise<void>((resolve) => {
        uiExposedResolver = resolve;
    });

    let sandboxExposed: any = null;
    let sandboxExposedResolver: (() => void) | null = null;
    const sandboxExposedPromise = new Promise<void>((resolve) => {
        sandboxExposedResolver = resolve;
    });

    const bridge = {
        getProxyFor(runtimeType: string): Promise<any> {
            if (runtimeType === "panel") {
                if (uiExposed) return Promise.resolve(createComlinkProxy(() => uiExposed));
                return new Promise((resolve, reject) => {
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
                return new Promise((resolve, reject) => {
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
        exposeApi(api) {
            uiExposed = api;
            uiExposedResolver?.();
        },
        async apiProxy(runtimeType) {
            return bridge.getProxyFor(runtimeType);
        }
    });

    sandboxRuntime.__setBridge(bridge);
    sandboxRuntime.exposeApi = (api) => {
        sandboxExposed = api;
        sandboxExposedResolver?.();
    };

    return {
        iframeRuntime: uiRuntime,
        sandboxRuntime: sandboxRuntime as any
    };
}

function createComlinkProxy(targetGetter: () => any): any {
    return new Proxy({}, {
        get(target, prop) {
            if (prop === "then") return undefined;
            const api = targetGetter();
            if (!api) {
                return Promise.reject(new Error("API not exposed yet."));
            }
            const val = api[prop];
            if (typeof val === "function") {
                return (...args: any[]) => {
                    try {
                        return Promise.resolve(val.apply(api, args));
                    } catch (err) {
                        return Promise.reject(err);
                    }
                };
            }
            return Promise.resolve(val);
        }
    });
}
