import { describe, it, expect } from "vitest";
import { editor } from "../src/index.js";

describe("Nodes", () => {
    it("should validate opacity range", () => {
        const rect = editor.createRectangle();
        rect.opacity = 0.5;
        expect(rect.opacity).toBe(0.5);

        expect(() => { rect.opacity = -0.1; }).toThrow(RangeError);
        expect(() => { rect.opacity = 1.1; }).toThrow(RangeError);
    });

    it("should validate ellipse rx/ry range", () => {
        const ellipse = editor.createEllipse();
        ellipse.rx = 30;
        ellipse.ry = 40;
        expect(ellipse.rx).toBe(30);
        expect(ellipse.ry).toBe(40);

        expect(() => { ellipse.rx = -10; }).toThrow(RangeError);
        expect(() => { ellipse.ry = 0; }).toThrow(RangeError);
    });

    it("should support cloning node", () => {
        const rect = editor.createRectangle();
        rect.width = 150;
        
        const artboard = editor.context.insertionParent;
        artboard.children.append(rect);

        const clone = rect.cloneInPlace();
        expect(clone.width).toBe(150);
        expect(clone.parent).toBe(artboard);
        expect(artboard.children.length).toBe(2);
    });
});
