import { MockNode } from "./Node.js";
import { SceneNodeType } from "../constants.js";

export interface MockStroke {
    type: string;
    color: { red: number, green: number, blue: number, alpha: number };
    width: number;
    position: string;
    dashPattern: number[];
    dashOffset: number;
}

export class MockStrokableNode extends MockNode {
    private _stroke: MockStroke | undefined;

    constructor(type: SceneNodeType) {
        super(type);
    }

    get stroke(): Readonly<MockStroke> | undefined {
        return this._stroke;
    }

    set stroke(val: MockStroke | undefined) {
        if (val) {
            this._stroke = { ...val };
        } else {
            this._stroke = undefined;
        }
    }
}
