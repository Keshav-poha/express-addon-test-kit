import { MockFillableNode } from "./FillableNode.js";
import { SceneNodeType, MIN_DIMENSION } from "../constants.js";
import { MockNode } from "./Node.js";

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
        if (val < MIN_DIMENSION) {
            throw new RangeError(`width must be at least ${MIN_DIMENSION}`);
        }
        this._width = val;
    }

    get height(): number {
        return this._height;
    }

    set height(val: number) {
        if (val < MIN_DIMENSION) {
            throw new RangeError(`height must be at least ${MIN_DIMENSION}`);
        }
        this._height = val;
    }

    protected override _copySubclassProperties(clone: MockNode): void {
        super._copySubclassProperties(clone);
        if (clone instanceof MockRectangleNode) {
            clone.topLeftCornerRadius = this.topLeftCornerRadius;
            clone.topRightCornerRadius = this.topRightCornerRadius;
            clone.bottomLeftCornerRadius = this.bottomLeftCornerRadius;
            clone.bottomRightCornerRadius = this.bottomRightCornerRadius;
        }
    }
}
