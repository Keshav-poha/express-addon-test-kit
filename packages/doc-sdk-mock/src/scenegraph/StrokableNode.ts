import { MockNode } from "./Node.js";
import { SceneNodeType } from "../constants.js";

/**
 * A stroke descriptor applied to a node's outline.
 */
export interface MockStroke {
    /** Stroke fill type — always `"color"` for solid strokes. */
    type: string;
    /** RGBA color of the stroke, with channels in the range [0, 1]. */
    color: { red: number; green: number; blue: number; alpha: number };
    /** Stroke width in pixels. */
    width: number;
    /** Position of the stroke relative to the node boundary. */
    position: string;
    /** Dash pattern lengths. Empty array for solid stroke. */
    dashPattern: number[];
    /** Offset into the dash pattern. */
    dashOffset: number;
}

/**
 * A scenegraph node that can have an outline stroke applied.
 */
export class MockStrokableNode extends MockNode {
    private _stroke: MockStroke | undefined;

    constructor(type: SceneNodeType) {
        super(type);
    }

    /**
     * The stroke applied to this node's outline, or `undefined` if none.
     * Assigning `undefined` removes the stroke.
     */
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

    protected override _copySubclassProperties(clone: any): void {
        super._copySubclassProperties(clone);
        if (this._stroke) {
            clone._stroke = { 
                ...this._stroke, 
                color: { ...this._stroke.color }, 
                dashPattern: [...this._stroke.dashPattern] 
            };
        }
    }
}
