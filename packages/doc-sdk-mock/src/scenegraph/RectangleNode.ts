import { MockFillableNode } from "./FillableNode.js";
import { SceneNodeType } from "../constants.js";

export class MockRectangleNode extends MockFillableNode {
    public topLeftCornerRadius: number = 0;
    public topRightCornerRadius: number = 0;
    public bottomLeftCornerRadius: number = 0;
    public bottomRightCornerRadius: number = 0;

    constructor() {
        super(SceneNodeType.rectangle);
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
