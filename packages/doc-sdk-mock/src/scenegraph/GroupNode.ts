import { MockNode } from "./Node.js";
import { MockItemList } from "./ItemList.js";
import { SceneNodeType } from "../constants.js";

export class MockGroupNode extends MockNode {
    public readonly children: MockItemList<MockNode>;
    public maskShape: any = undefined;

    constructor() {
        super(SceneNodeType.group);
        this.children = new MockItemList<MockNode>(this);
    }

    override get allChildren(): Readonly<Iterable<MockNode>> {
        return this.children.toArray();
    }

    override get boundsLocal(): Readonly<{ x: number, y: number, width: number, height: number }> {
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
