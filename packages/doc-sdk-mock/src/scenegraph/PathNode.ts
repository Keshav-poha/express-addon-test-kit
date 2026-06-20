import { MockFillableNode } from "./FillableNode.js";
import { SceneNodeType } from "../constants.js";

export class MockPathNode extends MockFillableNode {
    private _path: string;

    constructor(path: string = "M 0 0") {
        super(SceneNodeType.path);
        if (!path) {
            throw new Error("Path data cannot be empty.");
        }
        this._path = path;
    }

    get path(): string {
        return this._path;
    }

    protected override _copySubclassProperties(clone: MockPathNode): void {
        super._copySubclassProperties(clone);
        clone._path = this._path;
    }
}
