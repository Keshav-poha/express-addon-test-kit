import { MockNode } from "./Node.js";
import { MockItemList } from "./ItemList.js";
import { SceneNodeType } from "../constants.js";

/**
 * A group node that contains an ordered list of child nodes.
 * Groups compute their bounding box from their children.
 */
export class MockGroupNode extends MockNode {
    /** The direct children of this group. */
    public readonly children: MockItemList<MockNode>;
    /** Optional mask shape applied to clip the group's content. */
    public maskShape: MockNode | undefined = undefined;

    constructor() {
        super(SceneNodeType.group);
        this.children = new MockItemList<MockNode>(this);
    }

    protected override _copySubclassProperties(clone: MockGroupNode): void {
        super._copySubclassProperties(clone);
        if (this.maskShape) {
            // Temporarily clear parent to avoid automatic insertion in current parent
            const maskClone = this.maskShape.cloneInPlace() as MockNode;
            clone.maskShape = maskClone;
        }
        const clonedChildren = this.children.toArray().map(child => child.cloneInPlace() as MockNode);
        clone.children.append(...clonedChildren);
    }

    /**
     * Returns all descendants of this group via breadth-first traversal.
     */
    override get allChildren(): Iterable<MockNode> {
        const result: MockNode[] = [];
        if (this.maskShape) {
            result.push(this.maskShape);
        }
        const queue: MockNode[] = [...this.children.toArray()];
        while (queue.length > 0) {
            const node = queue.shift()!;
            result.push(node);
            for (const child of node.allChildren) {
                if (child instanceof MockNode) {
                    queue.push(child);
                }
            }
        }
        return result;
    }

    /**
     * Computes the bounding box of this group as the union of all children's bounding boxes.
     */
    override get boundsLocal(): Readonly<{ x: number; y: number; width: number; height: number }> {
        if (this.children.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const child of this.children) {
            const bounds = child.boundsInParent;
            if (bounds.x < minX) minX = bounds.x;
            if (bounds.y < minY) minY = bounds.y;
            if (bounds.x + bounds.width > maxX) maxX = bounds.x + bounds.width;
            if (bounds.y + bounds.height > maxY) maxY = bounds.y + bounds.height;
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
}
