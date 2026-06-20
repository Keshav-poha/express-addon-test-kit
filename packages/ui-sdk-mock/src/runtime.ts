import type { Runtime, RuntimeType, Dialog } from "./types.js";

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
            return (this._exposedApi || {}) as unknown as T;
        }

        throw new Error(`Unknown runtime type: ${runtimeType}`);
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
