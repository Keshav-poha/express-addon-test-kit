import type { ClientStorage } from "./types.js";

export class MockClientStorage implements ClientStorage {
    private storage = new Map<string, unknown>();

    async getItem(key: string): Promise<unknown> {
        return this.storage.get(key);
    }

    async setItem(key: string, value: unknown): Promise<void> {
        this.storage.set(key, value);
    }

    async removeItem(key: string): Promise<void> {
        this.storage.delete(key);
    }

    async keys(): Promise<string[]> {
        return Array.from(this.storage.keys());
    }

    async clear(): Promise<void> {
        this.storage.clear();
    }

    __reset(): void {
        this.storage.clear();
    }
}
