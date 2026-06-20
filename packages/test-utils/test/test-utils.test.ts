import { describe, it, expect, vi } from "vitest";
import {
    createDocument,
    createEllipse,
    createRectangle,
    createText,
    createLine,
    createGroup,
    createUser,
    createPremiumUser,
    createAnonymousUser,
    simulateLocaleChange,
    simulateThemeChange,
    simulateFormatChange,
    simulateSelectionChange,
    simulateDocumentIdAvailable,
    simulateDocumentLinkAvailable,
    simulateDocumentPublishedLinkAvailable,
    simulateDocumentTitleChange,
    simulateDocumentExportAllowedChange,
    simulateDragStart,
    simulateDragEnd,
    simulateDragCancel,
    setupOAuthMockSuccess,
    setupOAuthMockFailure
} from "../src/index.js";

describe("Test Utils Factories", () => {
    it("should create document with default options", async () => {
        const { sdk, editor, root } = createDocument();
        await sdk.ready;
        expect(sdk).toBeDefined();
        expect(editor).toBeDefined();
        expect(root).toBeDefined();
        expect(sdk.app.ui.locale).toBe("en-US");
        expect(sdk.app.ui.theme).toBe("light");
        expect(root.pages.length).toBe(1);
    });

    it("should create document with custom options", async () => {
        const { sdk, root } = createDocument({
            pagesCount: 3,
            locale: "fr-FR",
            theme: "dark"
        });
        await sdk.ready;
        expect(sdk.app.ui.locale).toBe("fr-FR");
        expect(sdk.app.ui.theme).toBe("dark");
        expect(root.pages.length).toBe(3);
    });

    it("should create an ellipse with options", () => {
        const ellipse = createEllipse({
            rx: 20,
            ry: 30,
            opacity: 0.5,
            locked: true,
            translation: { x: 10, y: 15 }
        });
        expect(ellipse.rx).toBe(20);
        expect(ellipse.ry).toBe(30);
        expect(ellipse.opacity).toBe(0.5);
        expect(ellipse.locked).toBe(true);
        expect(ellipse.translation).toEqual({ x: 10, y: 15 });
    });

    it("should create a rectangle with options", () => {
        const rect = createRectangle({
            width: 100,
            height: 200,
            opacity: 0.8
        });
        expect(rect.width).toBe(100);
        expect(rect.height).toBe(200);
        expect(rect.opacity).toBe(0.8);
    });

    it("should create a text node with content and options", () => {
        const text = createText("hello express", {
            opacity: 0.9,
            locked: false
        });
        expect(text.text).toBe("hello express");
        expect(text.opacity).toBe(0.9);
        expect(text.locked).toBe(false);
    });

    it("should create a line node with options", () => {
        const line = createLine({
            startX: 10,
            startY: 20,
            endX: 100,
            endY: 200,
            opacity: 0.4
        });
        expect(line.startX).toBe(10);
        expect(line.startY).toBe(20);
        expect(line.endX).toBe(100);
        expect(line.endY).toBe(200);
        expect(line.opacity).toBe(0.4);
    });

    it("should create a group node with children", () => {
        const rect = createRectangle({ width: 50 });
        const ellipse = createEllipse({ rx: 10 });
        const group = createGroup([rect, ellipse]);
        expect(group.children.length).toBe(2);
        expect(group.children.first).toBe(rect);
    });

    it("should create user profiles correctly", async () => {
        const normalUser = createUser({ userId: "user-123" });
        expect(await normalUser.userId()).toBe("user-123");
        expect(await normalUser.isPremiumUser()).toBe(false);
        expect(await normalUser.isAnonymousUser()).toBe(false);

        const premiumUser = createPremiumUser({ userId: "premium-456" });
        expect(await premiumUser.userId()).toBe("premium-456");
        expect(await premiumUser.isPremiumUser()).toBe(true);

        const anonymousUser = createAnonymousUser();
        expect(await anonymousUser.isAnonymousUser()).toBe(true);
    });
});

describe("Test Utils Simulation Helpers", () => {
    it("should simulate locale changes", async () => {
        const { sdk } = createDocument();
        await sdk.ready;
        const handler = vi.fn();
        sdk.app.on("localechange", handler);

        await simulateLocaleChange(sdk, "de-DE");

        expect(sdk.app.ui.locale).toBe("de-DE");
        expect(handler).toHaveBeenCalledWith({ locale: "de-DE" });
    });

    it("should simulate theme changes", async () => {
        const { sdk } = createDocument();
        await sdk.ready;
        const handler = vi.fn();
        sdk.app.on("themechange", handler);

        await simulateThemeChange(sdk, "dark");

        expect(sdk.app.ui.theme).toBe("dark");
        expect(handler).toHaveBeenCalledWith({ theme: "dark" });
    });

    it("should simulate format changes", async () => {
        const { sdk } = createDocument();
        await sdk.ready;
        const handler = vi.fn();
        sdk.app.on("formatchange", handler);

        await simulateFormatChange(sdk, "fr-CA");

        expect(sdk.app.ui.format).toBe("fr-CA");
        expect(handler).toHaveBeenCalledWith({ format: "fr-CA" });
    });

    it("should simulate selection changes", async () => {
        const { editor } = createDocument();
        const handler = vi.fn();
        const rect = createRectangle({ width: 50 });

        editor.context.on("selectionChange" as any, handler);

        await simulateSelectionChange(editor.context as any, rect);

        expect(editor.context.selectionIncludingNonEditable[0]).toBe(rect);
        expect(handler).toHaveBeenCalled();
    });

    it("should simulate document availability events", async () => {
        const { sdk } = createDocument();
        await sdk.ready;
        const idHandler = vi.fn();
        const linkHandler = vi.fn();
        const pubLinkHandler = vi.fn();
        const titleHandler = vi.fn();
        const exportHandler = vi.fn();

        sdk.app.on("documentIdAvailable", idHandler);
        sdk.app.on("documentLinkAvailable", linkHandler);
        sdk.app.on("documentPublishedLinkAvailable", pubLinkHandler);
        sdk.app.on("documentTitleChange", titleHandler);
        sdk.app.on("documentExportAllowedChange", exportHandler);

        await simulateDocumentIdAvailable(sdk, "new-id");
        expect(await sdk.app.document.id()).toBe("new-id");
        expect(idHandler).toHaveBeenCalledWith({ id: "new-id" });

        await simulateDocumentLinkAvailable(sdk, "https://doc.link");
        expect(await sdk.app.document.link({} as any)).toBe("https://doc.link");
        expect(linkHandler).toHaveBeenCalledWith({ link: "https://doc.link" });

        await simulateDocumentPublishedLinkAvailable(sdk, "https://pub.link");
        expect(pubLinkHandler).toHaveBeenCalledWith({ documentPublishedLink: "https://pub.link" });

        await simulateDocumentTitleChange(sdk, "New Title");
        expect(await sdk.app.document.title()).toBe("New Title");
        expect(titleHandler).toHaveBeenCalledWith({ title: "New Title" });

        await simulateDocumentExportAllowedChange(sdk, false);
        expect(await sdk.app.document.exportAllowed()).toBe(false);
        expect(exportHandler).toHaveBeenCalledWith({ exportAllowed: false });
    });

    it("should simulate drag events", async () => {
        const { sdk } = createDocument();
        await sdk.ready;
        const startHandler = vi.fn();
        const endHandler = vi.fn();
        const cancelHandler = vi.fn();

        sdk.app.on("dragstart", startHandler);
        sdk.app.on("dragend", endHandler);
        sdk.app.on("dragcancel", cancelHandler);

        const dummyElement = {} as HTMLElement;

        await simulateDragStart(sdk, dummyElement);
        expect(startHandler).toHaveBeenCalledWith({ element: dummyElement });

        await simulateDragEnd(sdk, false, dummyElement, "completed");
        expect(endHandler).toHaveBeenCalledWith({
            dropCancelled: false,
            element: dummyElement,
            dropCancelReason: "completed"
        });

        await simulateDragCancel(sdk);
        expect(cancelHandler).toHaveBeenCalled();
    });

    it("should configure OAuth mock returns", async () => {
        const { sdk } = createDocument();
        await sdk.ready;

        // 1. Success mock
        setupOAuthMockSuccess(sdk, "custom-code", "https://custom.redirect/");
        const successRes = await sdk.app.oauth.authorize({} as any);
        expect(successRes.code).toBe("custom-code");
        expect(successRes.redirectUri).toBe("https://custom.redirect/");
        expect(successRes.result.status).toBe("SUCCESS");

        // 2. Failure mock
        setupOAuthMockFailure(sdk, "FAILED", "Some oauth error occurred");
        const failureRes = await sdk.app.oauth.authorize({} as any);
        expect(failureRes.code).toBe("");
        expect(failureRes.result.status).toBe("FAILED");
        expect(failureRes.result.description).toBe("Some oauth error occurred");
    });
});
