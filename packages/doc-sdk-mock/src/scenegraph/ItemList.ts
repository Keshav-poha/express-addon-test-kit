import { MockRestrictedItemList } from "./RestrictedItemList.js";
import { MockBaseNode } from "./BaseNode.js";

/**
 * A mutable, ordered list of child nodes that enforces the single-parent invariant.
 * When a node is appended, it is automatically removed from any previous parent first.
 */
export class MockItemList<T extends MockBaseNode> extends MockRestrictedItemList<T> {
    private readonly owner: MockBaseNode;

    constructor(owner: MockBaseNode) {
        super();
        this.owner = owner;
    }

    /**
     * Appends one or more nodes to the end of this list.
     * Each node is removed from its previous parent before being added here.
     *
     * @param items - The nodes to append.
     */
    append(...items: T[]): void {
        for (const item of items) {
            item.removeFromParent();
            item.parent = this.owner;
            this.items.push(item);
        }
    }

    /**
     * Removes all nodes from this list, clearing each node's parent reference.
     */
    clear(): void {
        for (const item of this.items) {
            item.parent = undefined;
        }
        this.items = [];
    }

    /**
     * Replaces `oldItem` with `newItem` at the same position in the list.
     *
     * @param oldItem - The node to replace. Must be a current member of this list.
     * @param newItem - The replacement node.
     * @throws If `oldItem` is not found in this list.
     */
    replace(oldItem: T, newItem: T): void {
        const index = this.items.indexOf(oldItem);
        if (index === -1) {
            throw new Error("Old item not found in ItemList.");
        }
        oldItem.parent = undefined;
        newItem.removeFromParent();
        newItem.parent = this.owner;
        this.items[index] = newItem;
    }

    /**
     * Inserts `newItem` immediately before `before` in the list.
     *
     * @param newItem - The node to insert.
     * @param before - The node to insert before. Must be a current member of this list.
     * @throws If `before` is not found in this list.
     */
    insertBefore(newItem: T, before: T): void {
        const index = this.items.indexOf(before);
        if (index === -1) {
            throw new Error("Before item not found in ItemList.");
        }
        newItem.removeFromParent();
        newItem.parent = this.owner;
        this.items.splice(index, 0, newItem);
    }

    /**
     * Inserts `newItem` immediately after `after` in the list.
     *
     * @param newItem - The node to insert.
     * @param after - The node to insert after. Must be a current member of this list.
     * @throws If `after` is not found in this list.
     */
    insertAfter(newItem: T, after: T): void {
        const index = this.items.indexOf(after);
        if (index === -1) {
            throw new Error("After item not found in ItemList.");
        }
        newItem.removeFromParent();
        newItem.parent = this.owner;
        this.items.splice(index + 1, 0, newItem);
    }

    /**
     * Removes `item` from this list and clears its parent reference.
     * Has no effect if `item` is not currently in the list.
     *
     * @param item - The node to remove.
     */
    remove(item: T): void {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            item.parent = undefined;
            this.items.splice(index, 1);
        }
    }
}
