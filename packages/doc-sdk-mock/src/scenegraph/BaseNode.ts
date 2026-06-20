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
     * Removes this node from its parent's child list.
     * Safe to call even if the node has no parent.
     */
    removeFromParent(): void {
        if (this.parent) {
            const p = this.parent;
            if ("children" in p && typeof (p as { children: { remove: (n: MockBaseNode) => void } }).children?.remove === "function") {
                (p as { children: { remove: (n: MockBaseNode) => void } }).children.remove(this);
            } else if ("artboards" in p && typeof (p as { artboards: { remove: (n: MockBaseNode) => void } }).artboards?.remove === "function") {
                (p as { artboards: { remove: (n: MockBaseNode) => void } }).artboards.remove(this);
            } else if ("pages" in p && typeof (p as { pages: { remove: (n: MockBaseNode) => void } }).pages?.remove === "function") {
                (p as { pages: { remove: (n: MockBaseNode) => void } }).pages.remove(this);
            } else {
                this.parent = undefined;
            }
        }
    }
}
