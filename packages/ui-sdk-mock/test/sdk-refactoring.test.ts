import { describe, it, expect, afterEach } from "vitest";
import addOnUISdk, { createMockAddOnUISdk, SDKNotReadyError } from "../src/index.js";

describe("UI SDK Mock Refactoring", () => {
    afterEach(() => {
        addOnUISdk.__controls.resetAll();
    });

    it("should export a default instance of the mock SDK", () => {
        expect(addOnUISdk).toBeDefined();
        expect(addOnUISdk.apiVersion).toBe("1.0.0");
    });

    it("should allow instant synchronous access to app if readyDelayMs is 0", () => {
        const sdk = createMockAddOnUISdk({ readyDelayMs: 0 });
        // Should not throw SDKNotReadyError
        expect(() => sdk.app.ui).not.toThrow();
    });

    it("should throw if readyDelayMs > 0 and accessed synchronously", () => {
        const sdk = createMockAddOnUISdk({ readyDelayMs: 50 });
        expect(() => sdk.app.ui).toThrow(SDKNotReadyError);
    });

    it("should track registerCommand in __calls", async () => {
        const sdk = createMockAddOnUISdk();
        await sdk.ready;

        const handler = (params: Record<string, unknown>) => "test";
        sdk.app.command.register("test-command", handler);

        expect(sdk.app.__calls.registerCommand).toHaveLength(1);
        expect(sdk.app.__calls.registerCommand[0]).toEqual({
            command: "test-command",
            handler
        });
    });

    it("should reset all properties cascadingly on resetAll", async () => {
        const sdk = createMockAddOnUISdk();
        await sdk.ready;

        // Mutate some values
        sdk.app.ui.__setLocale("fr-FR");
        sdk.app.document.__setAsyncDelay(100);
        sdk.app.currentUser.__setUserId("custom-user");

        // Record a command call
        sdk.app.command.register("dummy", () => {});

        // Run reset
        sdk.__controls.resetAll();

        // Check defaults
        expect(sdk.app.ui.locale).toBe("en-US");
        expect(await sdk.app.currentUser.userId()).toBe("mock-user-id");
        expect(sdk.app.__calls.registerCommand).toHaveLength(0);
    });

    it("should support recursive proxying to nested objects with correct calling context", async () => {
        const sdk = createMockAddOnUISdk();
        await sdk.ready;

        const mockSandboxApi = {
            version: "1.2.3",
            user: {
                getName() {
                    return "John Doe";
                },
                profile: {
                    role: "admin",
                    getRole() {
                        // verify this context is kept
                        return this.role;
                    }
                }
            }
        };

        // Expose API on runtime (sandbox side)
        sdk.instance.runtime.exposeApi(mockSandboxApi);

        // Get proxy on UI side
        const proxy: any = await sdk.instance.runtime.apiProxy("panel" as any);

        // Test property retrieval
        expect(await proxy.version).toBe("1.2.3");

        // Test nested function call
        expect(await proxy.user.getName()).toBe("John Doe");

        // Test deeply nested property retrieval
        expect(await proxy.user.profile.role).toBe("admin");

        // Test deeply nested function call with correct 'this' context
        expect(await proxy.user.profile.getRole()).toBe("admin");
    });
});
