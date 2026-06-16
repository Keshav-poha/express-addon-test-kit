export class MockRestrictedItemList<T> {
    protected items: T[] = [];

    get length(): number {
        return this.items.length;
    }

    get first(): T | undefined {
        return this.items[0];
    }

    get last(): T | undefined {
        return this.items[this.items.length - 1];
    }

    item(index: number): T | undefined {
        return this.items[index];
    }

    indexOf(item: T): number {
        return this.items.indexOf(item);
    }

    toArray(): T[] {
        return [...this.items];
    }

    [Symbol.iterator](): Iterator<T> {
        return this.items[Symbol.iterator]();
    }
}
