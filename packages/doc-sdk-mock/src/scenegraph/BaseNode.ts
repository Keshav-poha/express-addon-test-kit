import { MockAddOnData } from "./AddOnData.js";
import { SceneNodeType } from "../constants.js";

/**
 * Base class for all scenegraph nodes.
 * Provides identity, parent tracking, add-on metadata, and visibility.
 */
export class MockBaseNode {
    private readonly _id: string;
    public type: SceneNodeType;
    public parent: MockBaseNode | undefined;
    private readonly _addOnData: MockAddOnData;
    private _visible: boolean = true;

    constructor(type: SceneNodeType) {
        this._id = crypto.randomUUID();
        this.type = type;
        this._addOnData = new MockAddOnData();
    }

    /** Unique identifier for this node. */
    get id(): string {
        return this._id;
    }

    /** Per-node storage for add-on metadata. */
    get addOnData(): MockAddOnData {
        return this._addOnData;
    }

    /** Whether this node is visible. Defaults to `true`. */
    get visible(): boolean {
        return this._visible;
    }

    set visible(val: boolean) {
        this._visible = val;
    }

    /**
     * Returns an iterator over all descendants of this node (breadth-first).
     * Override in subclasses that have children.
     */
    get allChildren(): Iterable<MockBaseNode> {
        return [];
    }

    /**
     * Removes a child from this node's collections.
     * Overridden by container subclasses.
     */
    __removeChild(child: MockBaseNode): void {
        // No-op base implementation
    }

    /**
     * Removes this node from its parent's child list.
     * Safe to call even if the node has no parent.
     */
    removeFromParent(): void {
        if (this.parent) {
            this.parent.__removeChild(this);
        }
    }
}
