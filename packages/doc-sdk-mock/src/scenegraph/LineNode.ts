import { MockStrokableNode } from "./StrokableNode.js";
import { SceneNodeType, ArrowHeadType } from "../constants.js";

export class MockLineNode extends MockStrokableNode {
    private _startX: number = 0;
    private _startY: number = 0;
    private _endX: number = 100;
    private _endY: number = 0;

    get startX(): number { return this._startX; }
    get startY(): number { return this._startY; }
    get endX(): number { return this._endX; }
    get endY(): number { return this._endY; }
    public startArrowHeadType: ArrowHeadType = ArrowHeadType.none;
    public endArrowHeadType: ArrowHeadType = ArrowHeadType.none;

    constructor() {
        super(SceneNodeType.line);
    }

    setEndPoints(startX: number, startY: number, endX: number, endY: number): void {
        this._startX = startX;
        this._startY = startY;
        this._endX = endX;
        this._endY = endY;
        this._width = Math.abs(endX - startX);
        this._height = Math.abs(endY - startY);
    }

    protected override _copySubclassProperties(clone: any): void {
        super._copySubclassProperties(clone);
        clone._startX = this.startX;
        clone._startY = this.startY;
        clone._endX = this.endX;
        clone._endY = this.endY;
        clone.startArrowHeadType = this.startArrowHeadType;
        clone.endArrowHeadType = this.endArrowHeadType;
    }
}
