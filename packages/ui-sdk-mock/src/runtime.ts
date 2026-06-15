import type { Runtime, RuntimeType, Dialog } from "./types.js";

export class MockRuntime implements Runtime {
    public readonly type: RuntimeType = "panel" as RuntimeType;
    public dialog?: Dialog;

    private _exposedApi: any = null;
    private _bridge: {
        exposeApi?: (apiObj: any) => void;
        apiProxy?: (runtimeType: RuntimeType) => Promise<any>;
    } | null = null;

    constructor(dialog?: Dialog) {
        if (dialog !== undefined) {
            this.dialog = dialog;
        }
    }

    exposeApi<T>(apiObj: T): void {
        if (this._bridge?.exposeApi) {
            this._bridge.exposeApi(apiObj);
        } else {
            this._exposedApi = apiObj;
        }
    }

    async apiProxy<T>(runtimeType: RuntimeType): Promise<any> {
        if (this._bridge?.apiProxy) {
            return this._bridge.apiProxy(runtimeType);
        }

        if (runtimeType === ("documentSandbox" as RuntimeType)) {
            return this._exposedApi || {};
        }

        throw new Error(`Unknown runtime type: ${runtimeType}`);
    }

    __setBridge(bridge: {
        exposeApi?: (apiObj: any) => void;
        apiProxy?: (runtimeType: RuntimeType) => Promise<any>;
    }): void {
        this._bridge = bridge;
        if (this._exposedApi && bridge.exposeApi) {
            bridge.exposeApi(this._exposedApi);
        }
    }
}
