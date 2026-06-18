import { MockNode } from "./Node.js";
import { MockRectangleNode } from "./RectangleNode.js";
import { MockBitmapImage } from "./BitmapImage.js";
import { SceneNodeType } from "../constants.js";

export class MockMediaContainerNode extends MockNode {
    public mediaRectangle: MockRectangleNode;
    public maskShape: any = undefined;
    private _bitmapImage: MockBitmapImage;

    constructor(bitmapImage: MockBitmapImage) {
        super(SceneNodeType.mediaContainer);
        this._bitmapImage = bitmapImage;
        this.mediaRectangle = new MockRectangleNode();
        this.mediaRectangle.width = bitmapImage.width;
        this.mediaRectangle.height = bitmapImage.height;
        this.mediaRectangle.parent = this;
    }

    override get allChildren(): Readonly<Iterable<MockNode>> {
        const list: MockNode[] = [this.mediaRectangle];
        if (this.maskShape) {
            list.push(this.maskShape);
        }
        return list;
    }

    replaceMedia(bitmapImage: MockBitmapImage): void {
        this._bitmapImage = bitmapImage;
        this.mediaRectangle.width = bitmapImage.width;
        this.mediaRectangle.height = bitmapImage.height;
    }

    get bitmapImage(): MockBitmapImage {
        return this._bitmapImage;
    }
}
