import { MockNode } from "./Node.js";
import { MockRectangleNode } from "./RectangleNode.js";
import { MockBitmapImage } from "./BitmapImage.js";
import { SceneNodeType } from "../constants.js";

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

    constructor(bitmapImage: MockBitmapImage) {
        super(SceneNodeType.mediaContainer);
        this._bitmapImage = bitmapImage;
        this.mediaRectangle = new MockRectangleNode();
        this.mediaRectangle.width = bitmapImage.width;
        this.mediaRectangle.height = bitmapImage.height;
        this.mediaRectangle.parent = this;
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
