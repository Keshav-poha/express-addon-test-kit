export class SDKNotReadyError extends Error {
    constructor() {
        super("AddOnSDKAPI is not ready. Accessing 'app' properties before the 'ready' promise resolves is invalid.");
        this.name = "SDKNotReadyError";
        Object.setPrototypeOf(this, SDKNotReadyError.prototype);
    }
}

export class UnknownRuntimeError extends Error {
    constructor(runtimeType: string) {
        super(`Unknown runtime type: ${runtimeType}`);
        this.name = "UnknownRuntimeError";
        Object.setPrototypeOf(this, UnknownRuntimeError.prototype);
    }
}
