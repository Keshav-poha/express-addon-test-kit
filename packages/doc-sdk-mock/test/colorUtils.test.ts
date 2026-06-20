import { describe, it, expect, beforeEach } from "vitest";
import { colorUtils, editor } from "../src/index.js";

describe("ColorUtils", () => {
    beforeEach(() => {
        editor.__resetMockState();
    });
    it("should support fromRGB and validate range", () => {
        const color = colorUtils.fromRGB(0.1, 0.2, 0.3, 0.4);
        expect(color).toEqual({ red: 0.1, green: 0.2, blue: 0.3, alpha: 0.4 });

        expect(() => colorUtils.fromRGB(1.2, 0, 0)).toThrow(RangeError);
    });

    it("should support fromHex and toHex parsing", () => {
        const color = colorUtils.fromHex("#ffffff");
        expect(color).toEqual({ red: 1, green: 1, blue: 1, alpha: 1 });

        const hex = colorUtils.toHex({ red: 0, green: 0, blue: 0, alpha: 1 });
        expect(hex).toBe("#000000ff");
    });
});
