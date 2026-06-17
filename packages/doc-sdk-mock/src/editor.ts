import { MockExpressRootNode } from "./scenegraph/ExpressRootNode.js";
import { MockExpressContext } from "./context.js";
import { MockEllipseNode } from "./scenegraph/EllipseNode.js";
import { MockRectangleNode } from "./scenegraph/RectangleNode.js";
import { MockStandaloneTextNode } from "./scenegraph/TextNode.js";
import { MockLineNode } from "./scenegraph/LineNode.js";
import { MockGroupNode } from "./scenegraph/GroupNode.js";
import { MockPathNode } from "./scenegraph/PathNode.js";
import { MockMediaContainerNode } from "./scenegraph/MediaContainerNode.js";
import { MockBitmapImage } from "./scenegraph/BitmapImage.js";
import { createDefaultDocumentTree } from "./scenegraph/tree.js";

export class MockExpressEditor {
    public documentRoot!: MockExpressRootNode;
    public context!: MockExpressContext;
    
    public __controls = {
        syncQueueAsyncEdit: false
    };

    constructor() {
        this.__resetMockState();
    }

    __resetMockState() {
        this.documentRoot = createDefaultDocumentTree();
        this.context = new MockExpressContext(this.documentRoot);
    }

    createEllipse(): MockEllipseNode {
        return new MockEllipseNode();
    }

    createRectangle(): MockRectangleNode {
        return new MockRectangleNode();
    }

    createText(textContent?: string): MockStandaloneTextNode {
        return new MockStandaloneTextNode(textContent ?? "");
    }

    createLine(): MockLineNode {
        return new MockLineNode();
    }

    createGroup(): MockGroupNode {
        return new MockGroupNode();
    }

    createPath(path: string): MockPathNode {
        return new MockPathNode(path);
    }

    createImageContainer(bitmapData: MockBitmapImage, options?: { initialSize?: any }): MockMediaContainerNode {
        const container = new MockMediaContainerNode(bitmapData);
        if (options?.initialSize) {
            container.mediaRectangle.width = options.initialSize.width;
            container.mediaRectangle.height = options.initialSize.height;
        }
        return container;
    }

    async loadBitmapImage(bitmapData: Blob): Promise<MockBitmapImage> {
        return new MockBitmapImage(bitmapData);
    }

    makeColorFill(color: { red: number, green: number, blue: number, alpha: number }): any {
        return {
            type: "color",
            color
        };
    }

    makeStroke(options?: any): any {
        return {
            type: "color",
            color: options?.color ?? { red: 0, green: 0, blue: 0, alpha: 1 },
            width: options?.width ?? 1,
            position: options?.position ?? "center",
            dashPattern: options?.dashPattern ?? [],
            dashOffset: options?.dashOffset ?? 0
        };
    }

    async queueAsyncEdit(lambda: () => void): Promise<void> {
        if (this.__controls.syncQueueAsyncEdit) {
            lambda();
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                queueMicrotask(() => {
                    try {
                        lambda();
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
    }
}

export const editor = new MockExpressEditor();
