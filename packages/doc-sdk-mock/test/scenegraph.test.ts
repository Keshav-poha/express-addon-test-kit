import { describe, it, expect, beforeEach } from "vitest";
import { editor, __resetMockState, NodeAlreadyParentedError } from "../src/index.js";

describe("Scenegraph", () => {
    beforeEach(() => {
        __resetMockState();
    });

    it("should initialize default tree with root -> 1 page -> 1 artboard", () => {
        expect(editor.documentRoot).toBeDefined();
        expect(editor.documentRoot.pages.length).toBe(1);
        expect(editor.documentRoot.pages.first?.artboards.length).toBe(1);
    });

    it("should reject double parenting and throw NodeAlreadyParentedError", () => {
        const rect = editor.createRectangle();
        const artboard = editor.context.insertionParent;
        
        artboard.children.append(rect);
        expect(rect.parent).toBe(artboard);
        expect(artboard.children.first).toBe(rect);

        const newArtboard = editor.documentRoot.pages.first!.artboards.addArtboard();
        
        // Enforce parent check
        expect(() => {
            newArtboard.children.append(rect);
        }).toThrow(NodeAlreadyParentedError);
    });
});
