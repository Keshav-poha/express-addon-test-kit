import { describe, it, expect, beforeEach } from "vitest";
import { editor, __resetMockState } from "../src/index.js";

describe("Scenegraph", () => {
    beforeEach(() => {
        __resetMockState();
    });

    it("should initialize default tree with root -> 1 page -> 1 artboard", () => {
        expect(editor.documentRoot).toBeDefined();
        expect(editor.documentRoot.pages.length).toBe(1);
        expect(editor.documentRoot.pages.first?.artboards.length).toBe(1);
    });

    it("should handle auto-reparenting on append", () => {
        const rect = editor.createRectangle();
        const artboard = editor.context.insertionParent;
        
        artboard.children.append(rect);
        expect(rect.parent).toBe(artboard);
        expect(artboard.children.first).toBe(rect);

        const newArtboard = editor.documentRoot.pages.first!.artboards.addArtboard();
        newArtboard.children.append(rect);

        expect(rect.parent).toBe(newArtboard);
        expect(artboard.children.length).toBe(0);
        expect(newArtboard.children.first).toBe(rect);
    });
});
