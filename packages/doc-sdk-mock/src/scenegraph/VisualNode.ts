import { MockBaseNode } from "./BaseNode.js";
import { SceneNodeType } from "../constants.js";

export class MockVisualNode extends MockBaseNode {
    public _width: number = 100;
    public _height: number = 100;

    constructor(type: SceneNodeType) {
        super(type);
    }

    get boundsLocal(): Readonly<{ x: number, y: number, width: number, height: number }> {
        return {
            x: 0,
            y: 0,
            width: this._width,
            height: this._height
        };
    }

    get centerPointLocal(): Readonly<{ x: number, y: number }> {
        return {
            x: this._width / 2,
            y: this._height / 2
        };
    }

    get topLeftLocal(): Readonly<{ x: number, y: number }> {
        return {
            x: 0,
            y: 0
        };
    }

    get visualRoot(): MockVisualNode {
        let node: MockVisualNode = this;
        while (node.parent && node.parent instanceof MockVisualNode) {
            node = node.parent;
        }
        return node;
    }

    localPointInNode(localPoint: { x: number, y: number }, targetNode: MockVisualNode): { x: number, y: number } {
        return {
            x: localPoint.x,
            y: localPoint.y
        };
    }
}
