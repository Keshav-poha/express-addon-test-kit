import { MockNode } from "./scenegraph/Node.js";
import { MockExpressRootNode } from "./scenegraph/ExpressRootNode.js";
import { MockPageNode } from "./scenegraph/PageNode.js";
import { MockArtboardNode } from "./scenegraph/ArtboardNode.js";
import { EditorEvent } from "./constants.js";

export class MockExpressContext {
    private _selection: MockNode[] = [];
    private _root: MockExpressRootNode;
    private handlers = new Map<EditorEvent, Set<() => void>>();

    constructor(root: MockExpressRootNode) {
        this._root = root;
        this.handlers.set(EditorEvent.selectionChange, new Set());
    }

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

    get selectionIncludingNonEditable(): readonly MockNode[] {
        return this._selection;
    }

    get hasSelection(): boolean {
        return this.selection.length > 0;
    }

    get currentPage(): MockPageNode {
        return this._root.pages.first!;
    }

    get insertionParent(): MockArtboardNode {
        return this.currentPage.artboards.first!;
    }

    on(eventName: EditorEvent, callback: () => void): string {
        const id = Math.random().toString(36).substring(2, 11);
        this.handlers.get(eventName)?.add(callback);
        return id;
    }

    off(eventName: EditorEvent, handlerId: string): void {
        this.handlers.get(eventName)?.clear();
    }

    private _fireSelectionChange() {
        const callbacks = this.handlers.get(EditorEvent.selectionChange);
        if (callbacks) {
            queueMicrotask(() => {
                callbacks.forEach(cb => cb());
            });
        }
    }
}
