import { MockVisualNode } from "./VisualNode.js";
import { MockItemList } from "./ItemList.js";
import { MockNode } from "./Node.js";
import { SceneNodeType } from "../constants.js";

export class MockArtboardNode extends MockVisualNode {
    public readonly children: MockItemList<MockNode>;
    private _fill: any;

    constructor() {
        super(SceneNodeType.artboard);
        this.children = new MockItemList<MockNode>(this);
        this._fill = {
            type: "color",
            color: { red: 1, green: 1, blue: 1, alpha: 1 }
        };
    }

    override get allChildren(): Readonly<Iterable<MockNode>> {
        return this.children.toArray();
    }

    get fill(): any {
        return this._fill;
    }

    set fill(val: any) {
        if (!val) {
            throw new Error("Artboards must always have a fill.");
        }
        this._fill = val;
    }

    get width(): number {
        return this.parent ? (this.parent as any).width : this._width;
    }

    get height(): number {
        return this.parent ? (this.parent as any).height : this._height;
    }
}
