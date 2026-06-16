import { MockFillableNode } from "./FillableNode.js";
import { SceneNodeType } from "../constants.js";

export class MockPathNode extends MockFillableNode {
    private _path: string;

    constructor(path: string) {
        super(SceneNodeType.path);
        if (!path) {
            throw new Error("Path data cannot be empty.");
        }
        this._path = path;
    }

    get path(): string {
        return this._path;
    }
}
