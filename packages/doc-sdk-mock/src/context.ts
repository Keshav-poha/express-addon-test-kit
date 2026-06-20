import { MockNode } from "./scenegraph/Node.js";
import { MockExpressRootNode } from "./scenegraph/ExpressRootNode.js";
import { MockPageNode } from "./scenegraph/PageNode.js";
import { MockArtboardNode } from "./scenegraph/ArtboardNode.js";
import { EditorEvent } from "./constants.js";

/**
 * The editor context, representing the current selection and insertion point
 * within the Document Sandbox. Mirrors `editor.context` from `express-document-sdk`.
 */
export class MockExpressContext {
    private _selection: MockNode[] = [];
    private readonly _root: MockExpressRootNode;
    /** Map from EditorEvent → (Map from handlerId → callback). */
    private readonly handlers = new Map<EditorEvent, Map<string, () => void>>();

    constructor(root: MockExpressRootNode) {
        this._root = root;
        this.handlers.set(EditorEvent.selectionChange, new Map());
    }

    /**
     * The currently selected nodes, excluding locked nodes.
     * Set this property to change the selection.
     */
    get selection(): readonly MockNode[] {
        return this._selection.filter(node => !node.locked);
    }

    set selection(nodes: MockNode | readonly MockNode[] | undefined) {
        if (!nodes) {
            this._selection = [];
        } else if (Array.isArray(nodes)) {
            this._selection = [...nodes];
        } else {
            this._selection = [nodes as MockNode];
        }
        this._fireSelectionChange();
    }

    /**
     * The full selection including locked nodes.
     * Use `selection` for the editable subset.
     */
    get selectionIncludingNonEditable(): readonly MockNode[] {
        return this._selection;
    }

    /** Whether any (non-locked) node is currently selected. */
    get hasSelection(): boolean {
        return this.selection.length > 0;
    }

    /** The current page (always the first page in this mock). */
    get currentPage(): MockPageNode {
        return this._root.pages.first!;
    }

    /**
     * The artboard into which new nodes are inserted.
     * Always the first artboard of the current page.
     */
    get insertionParent(): MockArtboardNode {
        return this.currentPage.artboards.first!;
    }

    /**
     * Registers a callback for the given editor event.
     *
     * @param eventName - The event to listen for.
     * @param callback - The function to call when the event fires.
     * @returns A handler ID string that can be passed to `off()` to unregister.
     */
    on(eventName: EditorEvent, callback: () => void): string {
        const id = crypto.randomUUID();
        const eventHandlers = this.handlers.get(eventName);
        if (eventHandlers) {
            eventHandlers.set(id, callback);
        }
        return id;
    }

    /**
     * Unregisters a specific handler by the ID returned from `on()`.
     *
     * @param eventName - The event the handler was registered for.
     * @param handlerId - The ID returned by `on()` when the handler was registered.
     */
    off(eventName: EditorEvent, handlerId: string): void {
        this.handlers.get(eventName)?.delete(handlerId);
    }

    private _fireSelectionChange(): void {
        const callbacks = this.handlers.get(EditorEvent.selectionChange);
        if (callbacks) {
            const snapshot = Array.from(callbacks.values());
            queueMicrotask(() => {
                for (const cb of snapshot) {
                    cb();
                }
            });
        }
    }
}
