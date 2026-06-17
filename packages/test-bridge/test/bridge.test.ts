import { describe, it, expect } from "vitest";
import { createBridge, BridgeTimeoutError } from "../src/index.js";

describe("TestBridge", () => {
    it("should support bidirectional API forwarding and Comlink Promisify simulation", async () => {
        const { iframeRuntime, sandboxRuntime } = createBridge();

        // 1. Expose API in sandbox, call from UI
        const sandboxApi = {
            addShape: (type: string, size: number) => {
                return { success: true, type, size };
            },
            someValue: 42
        };
        sandboxRuntime.exposeApi(sandboxApi);

        const sandboxProxy = await iframeRuntime.apiProxy("documentSandbox" as any);
        
        // Method call returns Promise
        const result = await sandboxProxy.addShape("ellipse", 50);
        expect(result).toEqual({ success: true, type: "ellipse", size: 50 });

        // Property access returns Promise
        const val = await sandboxProxy.someValue;
        expect(val).toBe(42);

        // 2. Expose API in UI, call from sandbox
        const uiApi = {
            onProgress: (percent: number) => `progress: ${percent}%`
        };
        iframeRuntime.exposeApi(uiApi);

        const uiProxy = await sandboxRuntime.apiProxy("panel" as any);
        const progressResult = await uiProxy.onProgress(85);
        expect(progressResult).toBe("progress: 85%");
    });

    it("should reject with BridgeTimeoutError on timeout", async () => {
        const { iframeRuntime } = createBridge({ timeout: 50 });
        
        await expect(iframeRuntime.apiProxy("documentSandbox" as any))
            .rejects.toThrow(BridgeTimeoutError);
    });

    it("should resolve apiProxy when exposeApi is called late", async () => {
        const { iframeRuntime, sandboxRuntime } = createBridge({ timeout: 200 });

        setTimeout(() => {
            sandboxRuntime.exposeApi({ val: "hello" });
        }, 50);

        const proxy = await iframeRuntime.apiProxy("documentSandbox" as any);
        expect(await proxy.val).toBe("hello");
    });
});
