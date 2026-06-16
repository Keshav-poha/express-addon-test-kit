import { MockBaseNode } from "./BaseNode.js";
import { MockRestrictedItemList } from "./RestrictedItemList.js";
import { MockArtboardNode } from "./ArtboardNode.js";
import { SceneNodeType } from "../constants.js";

export class MockArtboardList extends MockRestrictedItemList<MockArtboardNode> {
    private owner: any;

    constructor(owner: any) {
        super();
        this.owner = owner;
    }

    addArtboard(): MockArtboardNode {
        const artboard = new MockArtboardNode();
        artboard.parent = this.owner;
        this.items.push(artboard);
        return artboard;
    }

    remove(artboard: MockArtboardNode): void {
        if (this.items.length <= 1) {
            throw new Error("Cannot remove the last remaining artboard.");
        }
        const index = this.items.indexOf(artboard);
        if (index !== -1) {
            artboard.parent = undefined;
            this.items.splice(index, 1);
        }
    }
}

export class MockPageNode extends MockBaseNode {
    public readonly artboards: MockArtboardList;
    private _width: number = 800;
    private _height: number = 600;

    constructor(width: number = 800, height: number = 600) {
        super(SceneNodeType.page);
        this._width = width;
        this._height = height;
        this.artboards = new MockArtboardList(this);
        this.artboards.addArtboard();
    }

    get allChildren(): Readonly<Iterable<MockBaseNode>> {
        return this.artboards.toArray();
    }

    get width(): number {
        return this._width;
    }

    set width(val: number) {
        if (val <= 0) {
            throw new RangeError("width must be greater than 0");
        }
        this._width = val;
    }

    get height(): number {
        return this._height;
    }

    set height(val: number) {
        if (val <= 0) {
            throw new RangeError("height must be greater than 0");
        }
        this._height = val;
    }
}
