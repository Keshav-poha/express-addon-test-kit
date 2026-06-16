import { MockFillableNode } from "./FillableNode.js";
import { SceneNodeType } from "../constants.js";

export class MockEllipseNode extends MockFillableNode {
    private _rx: number = 50;
    private _ry: number = 50;

    constructor() {
        super(SceneNodeType.ellipse);
        this._width = 100;
        this._height = 100;
    }

    get rx(): number {
        return this._rx;
    }

    set rx(val: number) {
        if (val <= 0) {
            throw new RangeError("rx must be greater than 0");
        }
        this._rx = val;
        this._width = val * 2;
    }

    get ry(): number {
        return this._ry;
    }

    set ry(val: number) {
        if (val <= 0) {
            throw new RangeError("ry must be greater than 0");
        }
        this._ry = val;
        this._height = val * 2;
    }
}
