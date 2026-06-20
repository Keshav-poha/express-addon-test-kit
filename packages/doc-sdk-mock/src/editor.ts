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
import { MockFill } from "./scenegraph/FillableNode.js";
import { MockStroke } from "./scenegraph/StrokableNode.js";
import { createDefaultDocumentTree } from "./scenegraph/tree.js";
import { Color } from "./colorUtils.js";

/**
 * Options for constructing a stroke via `editor.makeStroke()`.
 */
export interface StrokeOptions {
    /** Stroke color. */
    color?: Color;
    /** Stroke width in pixels. Defaults to `1`. */
    width?: number;
    /** Position of the stroke. Defaults to `"center"`. */
    position?: string;
    /** Dash pattern. Defaults to `[]` (solid). */
    dashPattern?: number[];
    /** Dash offset. Defaults to `0`. */
    dashOffset?: number;
}

/**
 * The `editor` singleton — entry point for all document mutations in the Document Sandbox.
 * Mirrors the `editor` export from `express-document-sdk`.
 */
export class MockExpressEditor {
    /** The root node of the document scenegraph. */
    public documentRoot!: MockExpressRootNode;
    /** The current editor context, including selection and insertion point. */
    public context!: MockExpressContext;

    private _isEditAllowed: boolean = false;

    get isEditAllowed(): boolean {
        return this._isEditAllowed;
    }

    set isEditAllowed(val: boolean) {
        this._isEditAllowed = val;
    }

    /** Test-only controls for this editor instance. */
    public readonly __controls = {
        /**
         * When `true`, `queueAsyncEdit` executes its lambda synchronously.
         * Useful in tests that do not need to await microtasks.
         */
        syncQueueAsyncEdit: false,
        /**
         * When `true`, mutations are only allowed inside queueAsyncEdit.
         */
        strictEditMode: false
    };

    constructor() {
        this.__resetMockState();
    }

    /**
     * Resets the editor to a fresh document tree with one page and one artboard.
     * Call this in `afterEach` to ensure test isolation.
     */
    __resetMockState(): void {
        this.documentRoot = createDefaultDocumentTree();
        this.context = new MockExpressContext(this.documentRoot);
    }

    /**
     * Creates a new unparented ellipse node with default radii of 50px.
     *
     * @returns An unparented `MockEllipseNode`.
     */
    createEllipse(): MockEllipseNode {
        return new MockEllipseNode();
    }

    /**
     * Creates a new unparented rectangle node with default dimensions of 100×100px.
     *
     * @returns An unparented `MockRectangleNode`.
     */
    createRectangle(): MockRectangleNode {
        return new MockRectangleNode();
    }

    /**
     * Creates a new unparented standalone text node.
     *
     * @param textContent - Initial text content. Defaults to an empty string.
     * @returns An unparented `MockStandaloneTextNode`.
     */
    createText(textContent?: string): MockStandaloneTextNode {
        return new MockStandaloneTextNode(textContent ?? "");
    }

    /**
     * Creates a new unparented line node.
     *
     * @returns An unparented `MockLineNode`.
     */
    createLine(): MockLineNode {
        return new MockLineNode();
    }

    /**
     * Creates a new unparented group node.
     *
     * @returns An unparented `MockGroupNode`.
     */
    createGroup(): MockGroupNode {
        return new MockGroupNode();
    }

    /**
     * Creates a new unparented path node from an SVG path string.
     *
     * @param path - SVG path data string (e.g., `"M 0 0 L 100 100"`).
     * @returns An unparented `MockPathNode`.
     * @throws If `path` is empty.
     */
    createPath(path: string): MockPathNode {
        return new MockPathNode(path);
    }

    /**
     * Creates a new unparented media container wrapping a bitmap image.
     *
     * @param bitmapData - The bitmap image to wrap.
     * @param options - Optional initial size override for the media rectangle.
     * @returns An unparented `MockMediaContainerNode`.
     */
    createImageContainer(
        bitmapData: MockBitmapImage,
        options?: { initialSize?: { width: number; height: number } }
    ): MockMediaContainerNode {
        const container = new MockMediaContainerNode(bitmapData);
        if (options?.initialSize) {
            container.mediaRectangle.width = options.initialSize.width;
            container.mediaRectangle.height = options.initialSize.height;
        }
        return container;
    }

    /**
     * Loads a bitmap image from a Blob for use with `createImageContainer`.
     *
     * @param bitmapData - The image blob.
     * @returns A promise resolving to a `MockBitmapImage`.
     */
    async loadBitmapImage(bitmapData: Blob): Promise<MockBitmapImage> {
        return new MockBitmapImage(bitmapData);
    }

    /**
     * Creates a solid color fill descriptor suitable for assigning to `node.fill`.
     *
     * @param color - RGBA color with channels in [0, 1].
     * @returns A `MockFill` object.
     * @example
     * node.fill = editor.makeColorFill({ red: 1, green: 0, blue: 0, alpha: 1 });
     */
    makeColorFill(color: Color): MockFill {
        return {
            type: "color",
            color: { ...color }
        };
    }

    /**
     * Creates a stroke descriptor suitable for assigning to `node.stroke`.
     *
     * @param options - Stroke configuration. All fields are optional.
     * @returns A `MockStroke` object with sensible defaults.
     * @example
     * node.stroke = editor.makeStroke({ color: { red: 0, green: 0, blue: 0, alpha: 1 }, width: 2 });
     */
    makeStroke(options?: StrokeOptions): MockStroke {
        return {
            type: "color",
            color: options?.color ?? { red: 0, green: 0, blue: 0, alpha: 1 },
            width: options?.width ?? 1,
            position: options?.position ?? "center",
            dashPattern: options?.dashPattern ?? [],
            dashOffset: options?.dashOffset ?? 0
        };
    }

    /**
     * Queues a document mutation to run on the next microtask tick.
     * All document mutations in the real SDK must occur inside `queueAsyncEdit`.
     *
     * @param lambda - The mutation function to execute.
     * @returns A promise that resolves after the lambda has run.
     */
    async queueAsyncEdit(lambda: () => void): Promise<void> {
        const runWithLock = () => {
            const wasAllowed = this._isEditAllowed;
            this._isEditAllowed = true;
            try {
                lambda();
            } finally {
                this._isEditAllowed = wasAllowed;
            }
        };

        if (this.__controls.syncQueueAsyncEdit) {
            runWithLock();
            return Promise.resolve();
        }
        return new Promise<void>((resolve, reject) => {
            queueMicrotask(() => {
                try {
                    runWithLock();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }
}

/** Singleton instance matching the `express-document-sdk` export. */
export const editor = new MockExpressEditor();
