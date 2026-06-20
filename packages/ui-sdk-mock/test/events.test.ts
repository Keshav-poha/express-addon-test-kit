import { describe, it, expect, vi, afterEach } from "vitest";
import { TypedEventEmitter } from "../src/events.js";
import addOnUISdk from "../src/index.js";

describe("TypedEventEmitter", () => {
    afterEach(() => {
        addOnUISdk.__controls.resetAll();
    });
    it("should register and call handlers", async () => {
        const emitter = new TypedEventEmitter<{ test: string }>();
        const handler = vi.fn();
        emitter.on("test", handler);
        
        emitter.emit("test", "data");
        expect(handler).not.toHaveBeenCalled(); // microtask hasn't run
        
        await Promise.resolve(); // wait for microtask
        expect(handler).toHaveBeenCalledWith("data");
    });

    it("should remove handlers", async () => {
        const emitter = new TypedEventEmitter<{ test: string }>();
        const handler = vi.fn();
        emitter.on("test", handler);
        emitter.off("test", handler);
        
        emitter.emit("test", "data");
        await Promise.resolve();
        expect(handler).not.toHaveBeenCalled();
    });

    it("should remove all listeners", async () => {
        const emitter = new TypedEventEmitter<{ test: string, other: number }>();
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        emitter.on("test", handler1);
        emitter.on("other", handler2);
        
        emitter.removeAllListeners();
        
        emitter.emit("test", "data");
        emitter.emit("other", 123);
        await Promise.resolve();
        
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();
    });
});
