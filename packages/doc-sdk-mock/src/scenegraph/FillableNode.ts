import { MockStrokableNode } from "./StrokableNode.js";
import { SceneNodeType } from "../constants.js";

/**
 * A solid color fill descriptor.
 */
export interface MockFill {
    /** Fill type — always `"color"` for solid color fills. */
    type: string;
    /** RGBA color, with channels in the range [0, 1]. */
    color: { red: number; green: number; blue: number; alpha: number };
}

/**
 * A scenegraph node that can have a fill color applied to its interior.
 */
export class MockFillableNode extends MockStrokableNode {
    private _fill: MockFill | undefined;

    constructor(type: SceneNodeType) {
        super(type);
    }

    /**
     * The fill applied to this node's interior, or `undefined` if none.
     * Assigning `undefined` removes the fill.
     */
    get fill(): Readonly<MockFill> | undefined {
        return this._fill;
    }

    set fill(val: MockFill | undefined) {
        if (val) {
            this._fill = { ...val, color: { ...val.color } };
        } else {
            this._fill = undefined;
        }
    }
}
