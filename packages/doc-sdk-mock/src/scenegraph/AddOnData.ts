export class MockAddOnData {
    private data = new Map<string, string>();

    setItem(key: string, value: string): void {
        if (this.data.size >= 20 && !this.data.has(key)) {
            throw new Error("AddOnData key quota exceeded (max 20 keys).");
        }
        const totalSize = Array.from(this.data.entries()).reduce((sum, [k, v]) => sum + k.length + v.length, 0);
        if (totalSize + key.length + value.length > 3072) {
            throw new Error("AddOnData size quota exceeded (max 3KB).");
        }
        this.data.set(key, value);
    }

    getItem(key: string): string | undefined {
        return this.data.get(key);
    }

    removeItem(key: string): void {
        this.data.delete(key);
    }

    clear(): void {
        this.data.clear();
    }

    keys(): string[] {
        return Array.from(this.data.keys());
    }

    get remainingQuota(): Readonly<{ sizeInBytes: number, numKeys: number }> {
        const numKeys = 20 - this.data.size;
        const totalSize = Array.from(this.data.entries()).reduce((sum, [k, v]) => sum + k.length + v.length, 0);
        const sizeInBytes = 3072 - totalSize;
        return { sizeInBytes, numKeys };
    }

    [Symbol.iterator](): Iterator<[string, string]> {
        return this.data.entries()[Symbol.iterator]();
    }
}
