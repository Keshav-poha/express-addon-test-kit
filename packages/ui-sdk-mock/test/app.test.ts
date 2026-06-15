import { describe, it, expect, beforeEach } from "vitest";
import { createMockAddOnUISdk, SDKNotReadyError } from "../src/index.js";

describe("MockApplication", () => {
    let sdk: ReturnType<typeof createMockAddOnUISdk>;

    beforeEach(() => {
        sdk = createMockAddOnUISdk();
    });

    it("should throw SDKNotReadyError if app is accessed before ready resolves", () => {
        const delayedSdk = createMockAddOnUISdk({ readyDelayMs: 100 });
        expect(() => delayedSdk.app.ui).toThrow(SDKNotReadyError);
    });

    it("should resolve ready promise and allow app access", async () => {
        await sdk.ready;
        expect(sdk.app.ui.locale).toBe("en-US");
        expect(sdk.app.ui.theme).toBe("light");
    });

    it("should support event subscription and firing", async () => {
        await sdk.ready;
        let triggered = false;
        let eventData: any = null;

        sdk.app.on("themechange", (data) => {
            triggered = true;
            eventData = data;
        });

        sdk.app.emit("themechange", { theme: "dark" });
        
        // Wait for microtask
        await new Promise((resolve) => queueMicrotask(resolve));

        expect(triggered).toBe(true);
        expect(eventData).toEqual({ theme: "dark" });
    });

    it("should support showModalDialog and mock its response", async () => {
        await sdk.ready;
        
        // Configure next result
        sdk.app.__setNextDialogResult({ type: "alert", buttonType: "primary" } as any);

        const result = await sdk.app.showModalDialog({
            variant: "confirmation" as any,
            title: "Test Dialog",
            description: "Hello"
        } as any);

        expect(result).toEqual({ type: "alert", buttonType: "primary" });
        expect(sdk.app.__calls.showModalDialog).toHaveLength(1);
        expect(sdk.app.__calls.showModalDialog[0].dialogOptions.title).toBe("Test Dialog");
    });

    it("should support enableDragToDocument", async () => {
        await sdk.ready;
        const element = {} as HTMLElement;
        const callbacks = {
            previewCallback: () => new URL("https://test.com"),
            completionCallback: async () => []
        };

        const disable = sdk.app.enableDragToDocument(element, callbacks);
        expect(typeof disable).toBe("function");
        expect(sdk.app.__calls.enableDragToDocument).toHaveLength(1);
        expect(sdk.app.__calls.enableDragToDocument[0].element).toBe(element);
    });

    it("should support registerIframe", async () => {
        await sdk.ready;
        const iframe = {} as HTMLIFrameElement;
        
        const unregister = sdk.app.registerIframe(iframe);
        expect(typeof unregister).toBe("function");
        expect(sdk.app.__calls.registerIframe).toHaveLength(1);
        expect(sdk.app.__calls.registerIframe[0].element).toBe(iframe);
    });

    it("should support showColorPicker and hideColorPicker", async () => {
        await sdk.ready;
        const anchor = {} as HTMLElement;
        
        await sdk.app.showColorPicker(anchor, { initialColor: "#ff0000" });
        await sdk.app.hideColorPicker();

        expect(sdk.app.__calls.showColorPicker).toHaveLength(1);
        expect(sdk.app.__calls.showColorPicker[0].anchorElement).toBe(anchor);
        expect(sdk.app.__calls.hideColorPicker).toHaveLength(1);
    });

    it("should support monetization and platform queries", async () => {
        await sdk.ready;
        
        sdk.app.__setPremiumUpgradeResult(false);
        const upgradeResult = await sdk.app.startPremiumUpgradeIfFreeUser();
        expect(upgradeResult).toBe(false);

        const platform = await sdk.app.getCurrentPlatform();
        expect(platform.platform).toBe("chromeBrowser");
    });
});
