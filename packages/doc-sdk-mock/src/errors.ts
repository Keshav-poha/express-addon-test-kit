/**
 * Error thrown when an operation would violate the single-parent invariant
 * by adding a node to a parent when it already has a parent.
 */
export class NodeAlreadyParentedError extends Error {
    constructor() {
        super("Node already has a parent. A node can have at most one parent at a time.");
        this.name = "NodeAlreadyParentedError";
        Object.setPrototypeOf(this, NodeAlreadyParentedError.prototype);
    }
}
