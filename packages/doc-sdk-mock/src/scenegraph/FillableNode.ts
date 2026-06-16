import { MockStrokableNode } from "./StrokableNode.js";
import { SceneNodeType } from "../constants.js";

export interface MockFill {
    type: string;
    color: { red: number, green: number, blue: number, alpha: number };
}

export class MockFillableNode extends MockStrokableNode {
    private _fill: MockFill | undefined;

    constructor(type: SceneNodeType) {
        super(type);
    }

    get fill(): Readonly<MockFill> | undefined {
        return this._fill;
    }

    set fill(val: MockFill | undefined) {
        if (val) {
            this._fill = { ...val };
        } else {
            this._fill = undefined;
        }
    }
}
