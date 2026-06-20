import { MockBaseNode } from "./BaseNode.js";
import { MockRestrictedItemList } from "./RestrictedItemList.js";
import { MockArtboardNode } from "./ArtboardNode.js";
import { SceneNodeType } from "../constants.js";

/**
 * A list of artboards belonging to a single page.
 * Always contains at least one artboard; the last one cannot be removed.
 */
export class MockArtboardList extends MockRestrictedItemList<MockArtboardNode> {
    private readonly owner: MockPageNode;

    constructor(owner: MockPageNode) {
        super();
        this.owner = owner;
    }

    /**
     * Creates and appends a new artboard to this page.
     *
     * @returns The newly created artboard.
     */
    addArtboard(): MockArtboardNode {
        const artboard = new MockArtboardNode();
        artboard.parent = this.owner;
        this.items.push(artboard);
        return artboard;
    }

    /**
     * Removes an artboard from the page.
     *
     * @param artboard - The artboard to remove.
     * @throws If this is the last remaining artboard on the page.
     */
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

/**
 * Represents a single page in the Express document.
 * Each page has a fixed width/height and contains one or more artboards.
 */
export class MockPageNode extends MockBaseNode {
    /** The artboards on this page. */
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

    override __removeChild(child: MockBaseNode): void {
        if (child instanceof MockArtboardNode) {
            this.artboards.remove(child);
        }
    }

    override get allChildren(): Iterable<MockArtboardNode> {
        return this.artboards.toArray();
    }

    /** Width of this page in pixels. */
    get width(): number {
        return this._width;
    }

    set width(val: number) {
        if (val <= 0) {
            throw new RangeError("width must be greater than 0");
        }
        this._width = val;
    }

    /** Height of this page in pixels. */
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
