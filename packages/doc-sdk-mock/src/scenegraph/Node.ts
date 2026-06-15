import { MockVisualNode } from "./VisualNode.js";
import { SceneNodeType, BlendMode } from "../constants.js";

export class MockNode extends MockVisualNode {
    private _translation = { x: 0, y: 0 };
    private _rotation: number = 0;
    private _opacity: number = 1.0;
    private _locked: boolean = false;
    private _blendMode: BlendMode = BlendMode.normal;

    constructor(type: SceneNodeType) {
        super(type);
    }

    get translation(): Readonly<{ x: number, y: number }> {
        return this._translation;
    }

    set translation(val: { x: number, y: number }) {
        this._translation = { x: val.x, y: val.y };
    }

    get rotation(): number {
        return this._rotation;
    }

    set rotation(val: number) {
        this._rotation = val;
    }

    get rotationInScreen(): number {
        let rot = this._rotation;
        let p = this.parent;
        while (p && p instanceof MockNode) {
            rot += p.rotation;
            p = p.parent;
        }
        return rot;
    }

    setRotationInParent(angle: number, point: { x: number, y: number }): void {
        this._rotation = angle;
    }

    setPositionInParent(parentPoint: { x: number, y: number }, localRegistrationPoint: { x: number, y: number }): void {
        this._translation = {
            x: parentPoint.x - localRegistrationPoint.x,
            y: parentPoint.y - localRegistrationPoint.y
        };
    }

    get opacity(): number {
        return this._opacity;
    }

    set opacity(val: number) {
        if (val < 0 || val > 1) {
            throw new RangeError("Opacity must be between 0 and 1.");
        }
        this._opacity = val;
    }

    get locked(): boolean {
        return this._locked;
    }

    set locked(val: boolean) {
        this._locked = val;
    }

    get blendMode(): BlendMode {
        return this._blendMode;
    }

    set blendMode(val: BlendMode) {
        this._blendMode = val;
    }

    get boundsInParent(): Readonly<{ x: number, y: number, width: number, height: number }> {
        return {
            x: this._translation.x,
            y: this._translation.y,
            width: this._width,
            height: this._height
        };
    }

    boundsInNode(targetNode: MockVisualNode): Readonly<{ x: number, y: number, width: number, height: number }> {
        return {
            x: 0,
            y: 0,
            width: this._width,
            height: this._height
        };
    }

    get transformMatrix(): number[] {
        return [1, 0, 0, 1, this._translation.x, this._translation.y];
    }

    cloneInPlace(): MockNode {
        const clone = new (this.constructor as any)(this.type);
        clone._width = this._width;
        clone._height = this._height;
        clone.translation = this._translation;
        clone.rotation = this._rotation;
        clone.opacity = this._opacity;
        clone.locked = this._locked;
        clone.blendMode = this._blendMode;
        
        if (this.parent && (this.parent as any).children) {
            (this.parent as any).children.insertBefore(clone, this);
        }
        return clone;
    }

    rescaleProportionalToWidth(width: number): void {
        const ratio = width / this._width;
        this._width = width;
        this._height = this._height * ratio;
    }

    resizeToFitWithin(width: number, height: number): void {
        const ratio = Math.min(width / this._width, height / this._height);
        this._width = this._width * ratio;
        this._height = this._height * ratio;
    }

    resizeToCover(width: number, height: number): void {
        const ratio = Math.max(width / this._width, height / this._height);
        this._width = this._width * ratio;
        this._height = this._height * ratio;
    }
}
