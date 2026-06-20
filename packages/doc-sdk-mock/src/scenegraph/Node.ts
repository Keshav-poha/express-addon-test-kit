import { MockVisualNode } from "./VisualNode.js";
import { SceneNodeType, BlendMode } from "../constants.js";

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
        this._translation = { x: val.x, y: val.y };
    }

    /** Rotation angle in degrees (clockwise). */
    get rotation(): number {
        return this._rotation;
    }

    set rotation(val: number) {
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
        this._rotation = angle;
    }

    /**
     * Sets the position of this node relative to its parent, using a registration point on the node.
     *
     * @param parentPoint - Desired position in parent coordinate space.
     * @param localRegistrationPoint - Pivot point on this node, in local (0–1 normalized) space.
     */
    setPositionInParent(parentPoint: { x: number; y: number }, localRegistrationPoint: { x: number; y: number }): void {
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
        this._locked = val;
    }

    /** Blend mode applied when compositing this node. */
    get blendMode(): BlendMode {
        return this._blendMode;
    }

    set blendMode(val: BlendMode) {
        this._blendMode = val;
    }

    /** Bounding box of this node in parent coordinate space. */
    get boundsInParent(): Readonly<{ x: number; y: number; width: number; height: number }> {
        return {
            x: this._translation.x,
            y: this._translation.y,
            width: this._width,
            height: this._height
        };
    }

    /**
     * Returns the bounds of this node in the coordinate space of `targetNode`.
     *
     * @param targetNode - Node whose coordinate space to use.
     * @returns Approximate bounds. Note: rotation is not fully accounted for in this mock.
     */
    boundsInNode(targetNode: MockVisualNode): Readonly<{ x: number; y: number; width: number; height: number }> {
        // Approximate: translate from parent space, ignoring rotation across the chain.
        return {
            x: this._translation.x,
            y: this._translation.y,
            width: this._width,
            height: this._height
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

    /**
     * Duplicates this node in-place, inserting the clone immediately before this node in the parent.
     *
     * @returns The cloned node.
     */
    cloneInPlace(): this {
        const ctor = this.constructor as { new (type?: string): MockNode };
        const clone = (ctor.length > 0 && ctor.name !== "MockStandaloneTextNode" && ctor.name !== "MockPathNode")
            ? new ctor(this.type)
            : new ctor();
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
