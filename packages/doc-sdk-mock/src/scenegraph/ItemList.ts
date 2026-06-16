import { MockRestrictedItemList } from "./RestrictedItemList.js";

export class MockItemList<T extends { parent: any, removeFromParent: () => void }> extends MockRestrictedItemList<T> {
    private owner: any;

    constructor(owner: any) {
        super();
        this.owner = owner;
    }

    append(...items: T[]): void {
        for (const item of items) {
            item.removeFromParent();
            item.parent = this.owner;
            this.items.push(item);
        }
    }

    clear(): void {
        for (const item of this.items) {
            item.parent = undefined;
        }
        this.items = [];
    }

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

    insertBefore(newItem: T, before: T): void {
        const index = this.items.indexOf(before);
        if (index === -1) {
            throw new Error("Before item not found in ItemList.");
        }
        newItem.removeFromParent();
        newItem.parent = this.owner;
        this.items.splice(index, 0, newItem);
    }

    insertAfter(newItem: T, after: T): void {
        const index = this.items.indexOf(after);
        if (index === -1) {
            throw new Error("After item not found in ItemList.");
        }
        newItem.removeFromParent();
        newItem.parent = this.owner;
        this.items.splice(index + 1, 0, newItem);
    }

    remove(item: T): void {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            item.parent = undefined;
            this.items.splice(index, 1);
        }
    }
}
