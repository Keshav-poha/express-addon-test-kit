/**
 * Error thrown when a runtime fails to expose its API through the bridge
 * within the configured timeout period.
 */
export class BridgeTimeoutError extends Error {
    constructor(runtimeType: string) {
        super(`Bridge timeout waiting for API to be exposed in "${runtimeType}". Please ensure that the script in "${runtimeType}" executes successfully and registers its API by calling "runtime.exposeApi(...)".`);
        this.name = "BridgeTimeoutError";
        Object.setPrototypeOf(this, BridgeTimeoutError.prototype);
    }
}
