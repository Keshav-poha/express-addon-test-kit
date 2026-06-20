import { MockBaseNode } from "./BaseNode.js";
import { MockRestrictedItemList } from "./RestrictedItemList.js";
import { MockPageNode } from "./PageNode.js";
import { SceneNodeType } from "../constants.js";

/**
 * The ordered list of pages in the document.
 * Always contains at least one page; the last page cannot be removed.
 */
export class MockPageList extends MockRestrictedItemList<MockPageNode> {
    private readonly owner: MockExpressRootNode;

    constructor(owner: MockExpressRootNode) {
        super();
        this.owner = owner;
    }

    /**
     * Creates and appends a new page to the document.
     *
     * @param geometry - Optional width and height for the new page. Defaults to 800×600.
     * @returns The newly created page.
     */
    addPage(geometry?: { width: number; height: number }): MockPageNode {
        const page = new MockPageNode(geometry?.width ?? 800, geometry?.height ?? 600);
        page.parent = this.owner;
        this.items.push(page);
        return page;
    }

    /**
     * Removes a page from the document.
     *
     * @param page - The page to remove.
     * @throws If this is the last remaining page.
     */
    remove(page: MockPageNode): void {
        if (this.items.length <= 1) {
            throw new Error("Cannot remove the last remaining page.");
        }
        const index = this.items.indexOf(page);
        if (index !== -1) {
            page.parent = undefined;
            this.items.splice(index, 1);
        }
    }
}

/**
 * The root node of the Express scenegraph. Contains the ordered list of pages.
 */
export class MockExpressRootNode extends MockBaseNode {
    /** The pages in this document. */
    public readonly pages: MockPageList;

    constructor() {
        super(SceneNodeType.expressRoot);
        this.pages = new MockPageList(this);
    }

    override get allChildren(): Iterable<MockBaseNode> {
        return this.pages.toArray();
    }
}
