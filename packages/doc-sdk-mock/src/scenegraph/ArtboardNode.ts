import { MockVisualNode } from "./VisualNode.js";
import { MockItemList } from "./ItemList.js";
import { MockNode } from "./Node.js";
import { MockFill } from "./FillableNode.js";
import { MockPageNode } from "./PageNode.js";
import { SceneNodeType } from "../constants.js";

/**
 * A single artboard within a page. Contains a flat list of child nodes.
 * Artboards always have a fill and inherit dimensions from their parent page.
 */
export class MockArtboardNode extends MockVisualNode {
    /** The direct children of this artboard. */
    public readonly children: MockItemList<MockNode>;
    private _fill: MockFill;

    constructor() {
        super(SceneNodeType.artboard);
        this.children = new MockItemList<MockNode>(this);
        this._fill = {
            type: "color",
            color: { red: 1, green: 1, blue: 1, alpha: 1 }
        };
    }

    /**
     * Returns all descendants of this artboard via breadth-first traversal.
     */
    override get allChildren(): Iterable<MockNode> {
        const result: MockNode[] = [];
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
     * The background fill of this artboard.
     * Artboards always have a fill — setting `undefined` throws.
     */
    get fill(): Readonly<MockFill> {
        return this._fill;
    }

    set fill(val: MockFill | undefined) {
        if (!val) {
            throw new Error("Artboards must always have a fill.");
        }
        this._fill = { ...val, color: { ...val.color } };
    }

    /** Width of this artboard, derived from the parent page width. */
    get width(): number {
        if (this.parent instanceof MockPageNode) {
            return this.parent.width;
        }
        return this._width;
    }

    /** Height of this artboard, derived from the parent page height. */
    get height(): number {
        if (this.parent instanceof MockPageNode) {
            return this.parent.height;
        }
        return this._height;
    }
}
