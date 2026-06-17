import { describe, it, expect, beforeEach } from "vitest";
import { editor, __resetMockState, EditorEvent } from "../src/index.js";

describe("Editor and Selection", () => {
    beforeEach(() => {
        __resetMockState();
    });

    it("should support selection changes and events", async () => {
        const rect = editor.createRectangle();
        editor.context.selection = rect;
        expect(editor.context.selection[0]).toBe(rect);

        let triggered = false;
        editor.context.on(EditorEvent.selectionChange, () => {
            triggered = true;
        });

        editor.context.selection = [];
        await new Promise(resolve => queueMicrotask(resolve));
        expect(triggered).toBe(true);
    });

    it("should queue async edits correctly", async () => {
        let val = 0;
        const p = editor.queueAsyncEdit(() => {
            val = 42;
        });
        expect(val).toBe(0);
        await p;
        expect(val).toBe(42);
    });
});
