import { describe, it, expect, beforeEach } from "vitest";
import { editor, __resetMockState } from "../src/index.js";

describe("AddOnData Quota Management", () => {
    beforeEach(() => {
        __resetMockState();
    });

    it("should allow overwriting keys within the size limit without incorrectly accumulating the old sizes", () => {
        const rect = editor.createRectangle();
        const data = rect.addOnData;

        // Fill up close to the 3KB limit (3072 bytes)
        // Key length + value length = 3000 bytes
        const key = "testKey";
        const val1 = "a".repeat(2993); // 2993 + 7 = 3000 bytes
        data.setItem(key, val1);
        expect(data.remainingQuota.sizeInBytes).toBe(72);

        // If we set a new value of the same size, it should work because the old size is subtracted.
        // If it accumulated, it would throw "AddOnData size quota exceeded".
        const val2 = "a".repeat(2993);
        expect(() => {
            data.setItem(key, val2);
        }).not.toThrow();
        expect(data.remainingQuota.sizeInBytes).toBe(72);

        // Setting a larger value that exceeds the limit should still throw
        const tooLargeVal = "a".repeat(3100);
        expect(() => {
            data.setItem(key, tooLargeVal);
        }).toThrow(/size quota exceeded/);
    });

    it("should enforce the maximum key count quota", () => {
        const rect = editor.createRectangle();
        const data = rect.addOnData;

        for (let i = 0; i < 20; i++) {
            data.setItem(`key${i}`, "val");
        }
        expect(data.remainingQuota.numKeys).toBe(0);

        // Adding 21st key should throw
        expect(() => {
            data.setItem("key20", "val");
        }).toThrow(/key quota exceeded/);

        // Overwriting an existing key should still work even when at 20 keys limit
        expect(() => {
            data.setItem("key0", "newVal");
        }).not.toThrow();
    });
});
