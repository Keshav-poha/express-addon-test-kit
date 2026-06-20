import { MockBaseNode } from "./BaseNode.js";
import { SceneNodeType } from "../constants.js";

function transformPoint(pt: { x: number; y: number }, matrix: [number, number, number, number, number, number]): { x: number; y: number } {
    const [a, b, c, d, tx, ty] = matrix;
    return {
        x: a * pt.x + c * pt.y + tx,
        y: b * pt.x + d * pt.y + ty
    };
}

function multiplyMatrices(
    m1: [number, number, number, number, number, number],
    m2: [number, number, number, number, number, number]
): [number, number, number, number, number, number] {
    const [a1, b1, c1, d1, tx1, ty1] = m1;
    const [a2, b2, c2, d2, tx2, ty2] = m2;
    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * tx2 + c1 * ty2 + tx1,
        b1 * tx2 + d1 * ty2 + ty1
    ];
}

function invertMatrix(m: [number, number, number, number, number, number]): [number, number, number, number, number, number] {
    const [a, b, c, d, tx, ty] = m;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-8) {
        return [1, 0, 0, 1, -tx, -ty];
    }
    return [
        d / det,
        -b / det,
        -c / det,
        a / det,
        (c * ty - d * tx) / det,
        (b * tx - a * ty) / det
    ];
}

function getMatrixToRoot(node: MockVisualNode): [number, number, number, number, number, number] {
    let current: MockVisualNode | undefined = node;
    let matrix: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
    
    while (current) {
        if (typeof (current as any).transformMatrix !== "undefined") {
            matrix = multiplyMatrices((current as any).transformMatrix, matrix);
        }
        current = current.parent as MockVisualNode | undefined;
    }
    return matrix;
}

/**
 * A node with spatial dimensions and local coordinate bounds.
 * Extends BaseNode with width/height and geometric helpers.
 */
export class MockVisualNode extends MockBaseNode {
    protected _width: number = 100;
    protected _height: number = 100;

    constructor(type: SceneNodeType) {
        super(type);
    }

    /** Bounding box in local coordinate space. */
    get boundsLocal(): Readonly<{ x: number; y: number; width: number; height: number }> {
        return {
            x: 0,
            y: 0,
            width: this._width,
            height: this._height
        };
    }

    /** Center point in local coordinate space. */
    get centerPointLocal(): Readonly<{ x: number; y: number }> {
        return {
            x: this._width / 2,
            y: this._height / 2
        };
    }

    /** Top-left corner in local coordinate space (always `{0,0}`). */
    get topLeftLocal(): Readonly<{ x: number; y: number }> {
        return { x: 0, y: 0 };
    }

    /** Walks up the parent chain and returns the topmost VisualNode. */
    get visualRoot(): MockVisualNode {
        let node: MockVisualNode = this;
        while (node.parent && node.parent instanceof MockVisualNode) {
            node = node.parent;
        }
        return node;
    }

    /**
     * Transforms a point from this node's local coordinate space into `targetNode`'s local coordinate space.
     *
     * @param localPoint - The point in this node's coordinate space.
     * @param targetNode - The target node whose coordinate space to transform into.
     * @returns The transformed point.
     */
    localPointInNode(localPoint: { x: number; y: number }, targetNode: MockVisualNode): { x: number; y: number } {
        const matrixToRootThis = getMatrixToRoot(this);
        const matrixToRootTarget = getMatrixToRoot(targetNode);
        const invTarget = invertMatrix(matrixToRootTarget);
        const ptInRoot = transformPoint(localPoint, matrixToRootThis);
        return transformPoint(ptInRoot, invTarget);
    }
}
