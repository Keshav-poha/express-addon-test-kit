/**
 * Error thrown when a runtime fails to expose its API through the bridge
 * within the configured timeout period.
 */
export class BridgeTimeoutError extends Error {
    constructor(runtimeType: string) {
        super(`Bridge timeout waiting for api to be exposed in ${runtimeType}`);
        this.name = "BridgeTimeoutError";
        Object.setPrototypeOf(this, BridgeTimeoutError.prototype);
    }
}
