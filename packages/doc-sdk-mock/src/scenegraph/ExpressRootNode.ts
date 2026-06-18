import { MockBaseNode } from "./BaseNode.js";
import { MockRestrictedItemList } from "./RestrictedItemList.js";
import { MockPageNode } from "./PageNode.js";
import { SceneNodeType } from "../constants.js";

export class MockPageList extends MockRestrictedItemList<MockPageNode> {
    private owner: any;

    constructor(owner: any) {
        super();
        this.owner = owner;
    }

    addPage(geometry?: { width: number, height: number }): MockPageNode {
        const page = new MockPageNode(geometry?.width ?? 800, geometry?.height ?? 600);
        page.parent = this.owner;
        this.items.push(page);
        return page;
    }

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

export class MockExpressRootNode extends MockBaseNode {
    public readonly pages: MockPageList;

    constructor() {
        super(SceneNodeType.expressRoot);
        this.pages = new MockPageList(this);
    }

    override get allChildren(): Readonly<Iterable<MockBaseNode>> {
        return this.pages.toArray();
    }
}
