import { MockFillableNode } from "./FillableNode.js";
import { SceneNodeType, MIN_DIMENSION } from "../constants.js";
import { MockNode } from "./Node.js";

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
        if (val < MIN_DIMENSION / 2) {
            throw new RangeError(`rx must be at least ${MIN_DIMENSION / 2}`);
        }
        this._rx = val;
        this._width = val * 2;
    }

    get ry(): number {
        return this._ry;
    }

    set ry(val: number) {
        if (val < MIN_DIMENSION / 2) {
            throw new RangeError(`ry must be at least ${MIN_DIMENSION / 2}`);
        }
        this._ry = val;
        this._height = val * 2;
    }

    protected override _copySubclassProperties(clone: MockNode): void {
        super._copySubclassProperties(clone);
        if (clone instanceof MockEllipseNode) {
            clone._rx = this._rx;
            clone._ry = this._ry;
        }
    }
}
