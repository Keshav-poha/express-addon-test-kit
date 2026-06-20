import { MockVisualNode } from "./VisualNode.js";
import { SceneNodeType, BlendMode } from "../constants.js";
import { editor } from "../editor.js";
import { MockBaseNode } from "./BaseNode.js";

function checkEditAllowed(node: MockBaseNode) {
    if (editor.__controls.strictEditMode && !(editor as any)._isEditAllowed) {
        let current: MockBaseNode | undefined = node;
        let attached = false;
        while (current) {
            if (current.type === SceneNodeType.expressRoot) {
                attached = true;
                break;
            }
            current = current.parent;
        }
        if (attached) {
            throw new Error("Mutation failed: Scenegraph can only be mutated inside queueAsyncEdit.");
        }
    }
}

function rotateVec(vec: { x: number; y: number }, deg: number): { x: number; y: number } {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
        x: vec.x * cos - vec.y * sin,
        y: vec.x * sin + vec.y * cos
    };
}

function transformPoint(pt: { x: number; y: number }, matrix: [number, number, number, number, number, number]): { x: number; y: number } {
    const [a, b, c, d, tx, ty] = matrix;
    return {
        x: a * pt.x + c * pt.y + tx,
        y: b * pt.x + d * pt.y + ty
    };
}

/**
 * A positionable, rotatable, opaque node in the scenegraph.
 * Extends VisualNode with transform properties and layout helpers.
 */
export class MockNode extends MockVisualNode {
    private _translation = { x: 0, y: 0 };
    private _rotation: number = 0;
    private _opacity: number = 1.0;
    private _locked: boolean = false;
    private _blendMode: BlendMode = BlendMode.normal;

    constructor(type: SceneNodeType) {
        super(type);
    }

    /** Translation offset from parent coordinate origin, in pixels. */
    get translation(): Readonly<{ x: number; y: number }> {
        return this._translation;
    }

    set translation(val: { x: number; y: number }) {
        checkEditAllowed(this);
        this._translation = { x: val.x, y: val.y };
    }

    /** Rotation angle in degrees (clockwise). */
    get rotation(): number {
        return this._rotation;
    }

    set rotation(val: number) {
        checkEditAllowed(this);
        this._rotation = val;
    }

    /**
     * The node's rotation accumulated with all ancestor rotations,
     * giving the effective rotation relative to screen space.
     */
    get rotationInScreen(): number {
        let rot = this._rotation;
        let p = this.parent;
        while (p && p instanceof MockNode) {
            rot += p.rotation;
            p = p.parent;
        }
        return rot;
    }

    /**
     * Sets rotation of this node relative to its parent without changing apparent position.
     *
     * @param angle - New rotation angle in degrees.
     * @param point - The pivot point in parent coordinate space.
     */
    setRotationInParent(angle: number, point: { x: number; y: number }): void {
        checkEditAllowed(this);
        const diff = { x: point.x - this._translation.x, y: point.y - this._translation.y };
        const L = rotateVec(diff, -this._rotation);
        this._rotation = angle;
        const rotatedL = rotateVec(L, this._rotation);
        this._translation = {
            x: point.x - rotatedL.x,
            y: point.y - rotatedL.y
        };
    }

    /**
     * Sets the position of this node relative to its parent, using a registration point on the node.
     *
     * @param parentPoint - Desired position in parent coordinate space.
     * @param localRegistrationPoint - Pivot point on this node, in local (0–1 normalized) space.
     */
    setPositionInParent(parentPoint: { x: number; y: number }, localRegistrationPoint: { x: number; y: number }): void {
        checkEditAllowed(this);
        this._translation = {
            x: parentPoint.x - localRegistrationPoint.x * this._width,
            y: parentPoint.y - localRegistrationPoint.y * this._height
        };
    }

    /** Opacity from 0 (transparent) to 1 (fully opaque). Throws `RangeError` if out of range. */
    get opacity(): number {
        return this._opacity;
    }

    set opacity(val: number) {
        checkEditAllowed(this);
        if (val < 0 || val > 1) {
            throw new RangeError("Opacity must be between 0 and 1.");
        }
        this._opacity = val;
    }

    /** Whether this node is locked and cannot be interactively selected. */
    get locked(): boolean {
        return this._locked;
    }

    set locked(val: boolean) {
        checkEditAllowed(this);
        this._locked = val;
    }

    /** Blend mode applied when compositing this node. */
    get blendMode(): BlendMode {
        return this._blendMode;
    }

    set blendMode(val: BlendMode) {
        checkEditAllowed(this);
        this._blendMode = val;
    }

    /** Bounding box of this node in parent coordinate space. */
    get boundsInParent(): Readonly<{ x: number; y: number; width: number; height: number }> {
        const bounds = this.boundsLocal;
        const matrix = this.transformMatrix;
        const c1 = transformPoint({ x: bounds.x, y: bounds.y }, matrix);
        const c2 = transformPoint({ x: bounds.x + bounds.width, y: bounds.y }, matrix);
        const c3 = transformPoint({ x: bounds.x, y: bounds.y + bounds.height }, matrix);
        const c4 = transformPoint({ x: bounds.x + bounds.width, y: bounds.y + bounds.height }, matrix);
        
        const minX = Math.min(c1.x, c2.x, c3.x, c4.x);
        const maxX = Math.max(c1.x, c2.x, c3.x, c4.x);
        const minY = Math.min(c1.y, c2.y, c3.y, c4.y);
        const maxY = Math.max(c1.y, c2.y, c3.y, c4.y);
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Returns the bounds of this node in the coordinate space of `targetNode`.
     *
     * @param targetNode - Node whose coordinate space to use.
     * @returns The bounds in targetNode's coordinate space.
     */
    boundsInNode(targetNode: MockVisualNode): Readonly<{ x: number; y: number; width: number; height: number }> {
        const bounds = this.boundsLocal;
        const c1 = this.localPointInNode({ x: bounds.x, y: bounds.y }, targetNode);
        const c2 = this.localPointInNode({ x: bounds.x + bounds.width, y: bounds.y }, targetNode);
        const c3 = this.localPointInNode({ x: bounds.x, y: bounds.y + bounds.height }, targetNode);
        const c4 = this.localPointInNode({ x: bounds.x + bounds.width, y: bounds.y + bounds.height }, targetNode);
        
        const minX = Math.min(c1.x, c2.x, c3.x, c4.x);
        const maxX = Math.max(c1.x, c2.x, c3.x, c4.x);
        const minY = Math.min(c1.y, c2.y, c3.y, c4.y);
        const maxY = Math.max(c1.y, c2.y, c3.y, c4.y);
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Returns a 2D affine transform matrix [a,b,c,d,tx,ty] incorporating translation and rotation.
     */
    get transformMatrix(): [number, number, number, number, number, number] {
        const rad = (this._rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [cos, sin, -sin, cos, this._translation.x, this._translation.y];
    }

    protected _clone(): this {
        return new (this.constructor as any)() as this;
    }

    /**
     * Duplicates this node in-place, inserting the clone immediately before this node in the parent.
     *
     * @returns The cloned node.
     */
    cloneInPlace(): this {
        const clone = this._clone();
        clone._width = this._width;
        clone._height = this._height;
        clone.translation = { ...this._translation };
        clone.rotation = this._rotation;
        clone.opacity = this._opacity;
        clone.locked = this._locked;
        clone.blendMode = this._blendMode;

        this._copySubclassProperties(clone);

        if (this.parent) {
            const parentWithChildren = this.parent as MockNode & { children?: { insertBefore: (n: MockNode, before: MockNode) => void } };
            if (parentWithChildren.children && typeof parentWithChildren.children.insertBefore === "function") {
                parentWithChildren.children.insertBefore(clone, this);
            }
        }
        return clone as this;
    }

    protected _copySubclassProperties(clone: any): void {
        // Overridden by subclasses
    }

    /**
     * Resizes this node proportionally to the specified width.
     *
     * @param width - New width in pixels.
     */
    rescaleProportionalToWidth(width: number): void {
        const ratio = width / this._width;
        this._width = width;
        this._height = this._height * ratio;
    }

    /**
     * Resizes this node to fit within the given bounds while preserving aspect ratio.
     *
     * @param width - Maximum width.
     * @param height - Maximum height.
     */
    resizeToFitWithin(width: number, height: number): void {
        const ratio = Math.min(width / this._width, height / this._height);
        this._width = this._width * ratio;
        this._height = this._height * ratio;
    }

    /**
     * Resizes this node to cover the given bounds while preserving aspect ratio.
     *
     * @param width - Target width.
     * @param height - Target height.
     */
    resizeToCover(width: number, height: number): void {
        const ratio = Math.max(width / this._width, height / this._height);
        this._width = this._width * ratio;
        this._height = this._height * ratio;
    }
}
