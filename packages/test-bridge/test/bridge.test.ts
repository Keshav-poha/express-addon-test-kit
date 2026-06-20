import { describe, it, expect, beforeEach } from "vitest";
import { createBridge, BridgeTimeoutError } from "../src/index.js";
import { editor, __resetMockState } from "@express-addon-tests/doc-sdk-mock";

describe("TestBridge", () => {
    beforeEach(() => {
        __resetMockState();
    });

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

    it("should support addShape to create an ellipse in the document", async () => {
        const { iframeRuntime, sandboxRuntime } = createBridge();

        // Define API on the sandbox side using doc-sdk-mock
        const sandboxApi = {
            addShape: (type: string, rx: number, ry: number) => {
                if (type === "ellipse") {
                    const ellipse = editor.createEllipse();
                    ellipse.rx = rx;
                    ellipse.ry = ry;
                    editor.context.insertionParent.children.append(ellipse);
                    return { success: true, id: ellipse.id };
                }
                return { success: false };
            }
        };
        sandboxRuntime.exposeApi(sandboxApi as any);

        // Get proxy on the iframe runtime side
        const sandboxProxy = await iframeRuntime.apiProxy<{
            addShape: (type: string, rx: number, ry: number) => Promise<{ success: boolean; id: string }>
        }>("documentSandbox" as any);

        // Call the API over the bridge
        const result = await sandboxProxy.addShape("ellipse", 100, 150);
        expect(result.success).toBe(true);
        expect(result.id).toBeDefined();

        // Verify side-effects in doc-sdk-mock scenegraph
        const children = Array.from(editor.context.insertionParent.children);
        const createdNode = children.find(child => child.id === result.id);
        expect(createdNode).toBeDefined();
        expect(createdNode?.type).toBe("ellipse");
        
        // Check properties on the created ellipse
        const ellipseNode = createdNode as any;
        expect(ellipseNode.rx).toBe(100);
        expect(ellipseNode.ry).toBe(150);
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
