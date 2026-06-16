import { MockStrokableNode } from "./StrokableNode.js";
import { SceneNodeType, ArrowHeadType } from "../constants.js";

export class MockLineNode extends MockStrokableNode {
    public startX: number = 0;
    public startY: number = 0;
    public endX: number = 100;
    public endY: number = 0;
    public startArrowHeadType: ArrowHeadType = ArrowHeadType.none;
    public endArrowHeadType: ArrowHeadType = ArrowHeadType.none;

    constructor() {
        super(SceneNodeType.line);
    }

    setEndPoints(startX: number, startY: number, endX: number, endY: number): void {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this._width = Math.abs(endX - startX);
        this._height = Math.abs(endY - startY);
    }
}
