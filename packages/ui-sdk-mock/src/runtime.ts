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

function createComlinkProxy(target: Record<string, unknown>): unknown {
    return new Proxy({}, {
        get(t, prop: string) {
            if (prop === "then") return undefined;
            const val = target[prop];
            if (typeof val === "function") {
                return (...args: unknown[]) => {
                    try {
                        return Promise.resolve(val.apply(target, args));
                    } catch (err) {
                        return Promise.reject(err);
                    }
                };
            }
            return Promise.resolve(val);
        }
    });
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

        if (runtimeType === ("documentSandbox" as RuntimeType)) {
            return createComlinkProxy(this._exposedApi || {}) as unknown as T;
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
