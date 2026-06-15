import { MockAddOnData } from "./AddOnData.js";
import { SceneNodeType } from "../constants.js";

export class MockBaseNode {
    private readonly _id: string;
    public type: SceneNodeType;
    public parent: MockBaseNode | undefined;
    private readonly _addOnData: MockAddOnData;

    constructor(type: SceneNodeType) {
        this._id = "node-" + Math.random().toString(36).substring(2, 11);
        this.type = type;
        this._addOnData = new MockAddOnData();
    }

    get id(): string {
        return this._id;
    }

    get addOnData(): MockAddOnData {
        return this._addOnData;
    }

    get allChildren(): Readonly<Iterable<MockBaseNode>> {
        return [];
    }

    removeFromParent(): void {
        if (this.parent) {
            const p = this.parent as any;
            if (p.children && typeof p.children.remove === "function") {
                p.children.remove(this);
            } else if (p.artboards && typeof p.artboards.remove === "function") {
                p.artboards.remove(this);
            } else if (p.pages && typeof p.pages.remove === "function") {
                p.pages.remove(this);
            } else {
                this.parent = undefined;
            }
        }
    }
}
