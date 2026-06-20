import { MockBaseNode } from "./BaseNode.js";
import { SceneNodeType } from "../constants.js";

/**
 * A node with spatial dimensions and local coordinate bounds.
 * Extends BaseNode with width/height and geometric helpers.
 */
export class MockVisualNode extends MockBaseNode {
    protected _width: number = 100;
    protected _height: number = 100;

    constructor(type: SceneNodeType) {
        super(type);
    }

    /** Bounding box in local coordinate space. */
    get boundsLocal(): Readonly<{ x: number; y: number; width: number; height: number }> {
        return {
            x: 0,
            y: 0,
            width: this._width,
            height: this._height
        };
    }

    /** Center point in local coordinate space. */
    get centerPointLocal(): Readonly<{ x: number; y: number }> {
        return {
            x: this._width / 2,
            y: this._height / 2
        };
    }

    /** Top-left corner in local coordinate space (always `{0,0}`). */
    get topLeftLocal(): Readonly<{ x: number; y: number }> {
        return { x: 0, y: 0 };
    }

    /** Walks up the parent chain and returns the topmost VisualNode. */
    get visualRoot(): MockVisualNode {
        let node: MockVisualNode = this;
        while (node.parent && node.parent instanceof MockVisualNode) {
            node = node.parent;
        }
        return node;
    }

    /**
     * Transforms a point from this node's local coordinate space into `targetNode`'s local coordinate space.
     *
     * @param localPoint - The point in this node's coordinate space.
     * @param targetNode - The target node whose coordinate space to transform into.
     * @returns The transformed point. Note: this mock returns the input point unchanged
     *   (coordinate transforms across the tree are not fully simulated).
     */
    localPointInNode(localPoint: { x: number; y: number }, targetNode: MockVisualNode): { x: number; y: number } {
        return {
            x: localPoint.x,
            y: localPoint.y
        };
    }
}
