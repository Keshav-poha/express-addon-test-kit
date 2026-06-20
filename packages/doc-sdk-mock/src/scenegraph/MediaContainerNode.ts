import { MockNode } from "./Node.js";
import { MockRectangleNode } from "./RectangleNode.js";
import { MockBitmapImage } from "./BitmapImage.js";
import { SceneNodeType } from "../constants.js";
import { MockBaseNode } from "./BaseNode.js";

/**
 * A node that wraps a bitmap image within a rectangular clipping frame.
 * Optionally supports a mask shape to clip the image non-rectangularly.
 */
export class MockMediaContainerNode extends MockNode {
    /** The rectangle defining the image's visible area. */
    public mediaRectangle: MockRectangleNode;
    /** Optional mask shape applied to clip the media. */
    public maskShape: MockNode | undefined = undefined;
    private _bitmapImage: MockBitmapImage;

    constructor(bitmapImage?: MockBitmapImage) {
        super(SceneNodeType.mediaContainer);
        const img = bitmapImage ?? new MockBitmapImage(new Blob());
        this._bitmapImage = img;
        this.mediaRectangle = new MockRectangleNode();
        this.mediaRectangle.width = img.width;
        this.mediaRectangle.height = img.height;
        this.mediaRectangle.parent = this;
    }

    protected override _copySubclassProperties(clone: MockNode): void {
        super._copySubclassProperties(clone);
        if (clone instanceof MockMediaContainerNode) {
            clone._bitmapImage = this._bitmapImage;
            const rectClone = this.mediaRectangle.cloneInPlace();
            clone.mediaRectangle = rectClone;
            rectClone.parent = clone;

            if (this.maskShape) {
                const maskClone = this.maskShape.cloneInPlace() as MockNode;
                clone.maskShape = maskClone;
                maskClone.parent = clone;
            }
        }
    }

    override __removeChild(child: MockBaseNode): void {
        if (child === this.maskShape) {
            this.maskShape = undefined;
            child.parent = undefined;
        } else if (child === this.mediaRectangle) {
            this.mediaRectangle = undefined!;
            child.parent = undefined;
        }
    }

    /**
     * Returns the children of this container (mediaRectangle, and optionally maskShape).
     */
    override get allChildren(): Iterable<MockNode> {
        const list: MockNode[] = [this.mediaRectangle];
        if (this.maskShape) {
            list.push(this.maskShape);
        }
        return list;
    }

    /**
     * Replaces the image content with a new bitmap, resizing the media rectangle to match.
     *
     * @param bitmapImage - The new bitmap image.
     */
    replaceMedia(bitmapImage: MockBitmapImage): void {
        this._bitmapImage = bitmapImage;
        this.mediaRectangle.width = bitmapImage.width;
        this.mediaRectangle.height = bitmapImage.height;
    }

    /** The underlying bitmap image data. */
    get bitmapImage(): MockBitmapImage {
        return this._bitmapImage;
    }
}
