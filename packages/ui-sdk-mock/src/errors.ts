/**
 * Error thrown when an add-on attempts to access SDK APIs (such as `app`)
 * before the asynchronous `ready` promise has fully resolved.
 */
export class SDKNotReadyError extends Error {
    constructor() {
        super("AddOnSDKAPI is not ready. Accessing 'app' properties before the 'ready' promise resolves is invalid.");
        this.name = "SDKNotReadyError";
        Object.setPrototypeOf(this, SDKNotReadyError.prototype);
    }
}

/**
 * Error thrown when an invalid runtime type is specified during mock initialization.
 */
export class UnknownRuntimeError extends Error {
    constructor(runtimeType: string) {
        super(`Unknown runtime type: ${runtimeType}`);
        this.name = "UnknownRuntimeError";
        Object.setPrototypeOf(this, UnknownRuntimeError.prototype);
    }
}
