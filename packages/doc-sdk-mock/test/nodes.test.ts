import { describe, it, expect, beforeEach } from "vitest";
import { editor } from "../src/index.js";

describe("Nodes", () => {
    beforeEach(() => {
        editor.__resetMockState();
    });
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

        expect(() => { ellipse.rx = 0.49; }).toThrow(RangeError);
        expect(() => { ellipse.ry = 0.49; }).toThrow(RangeError);
        expect(() => { ellipse.rx = 0.5; }).not.toThrow();
    });

    it("should validate rectangle width/height range", () => {
        const rect = editor.createRectangle();
        rect.width = 50;
        rect.height = 60;
        expect(rect.width).toBe(50);
        expect(rect.height).toBe(60);

        expect(() => { rect.width = 0.9; }).toThrow(RangeError);
        expect(() => { rect.height = 0.9; }).toThrow(RangeError);
        expect(() => { rect.width = 1; }).not.toThrow();
    });

    it("should validate page width/height range", () => {
        const page = editor.documentRoot.pages.first!;
        page.width = 1000;
        page.height = 800;
        expect(page.width).toBe(1000);
        expect(page.height).toBe(800);

        expect(() => { page.width = 0.9; }).toThrow(RangeError);
        expect(() => { page.height = 0.9; }).toThrow(RangeError);
        expect(() => { page.width = 1; }).not.toThrow();
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
