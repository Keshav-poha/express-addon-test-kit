import { createMockAddOnUISdk, MockCurrentUser } from "@express-addon-tests/ui-sdk-mock";
import {
    editor,
    EllipseNode,
    RectangleNode,
    StandaloneTextNode,
    LineNode,
    GroupNode
} from "@express-addon-tests/doc-sdk-mock";

export function createDocument(options?: { pagesCount?: number; locale?: string; theme?: string }) {
    const sdk = createMockAddOnUISdk({
        entrypointType: "panel"
    });
    
    if (options?.locale) {
        sdk.app.ui.__setLocale(options.locale);
    }
    if (options?.theme) {
        sdk.app.ui.__setTheme(options.theme as any);
    }

    const root = editor.documentRoot;
    const pagesCount = options?.pagesCount ?? 1;
    for (let i = 1; i < pagesCount; i++) {
        root.pages.addPage();
    }

    return { sdk, editor, root };
}

export function createEllipse(options?: any): EllipseNode {
    const node = editor.createEllipse();
    if (options) {
        if (options.rx !== undefined) node.rx = options.rx;
        if (options.ry !== undefined) node.ry = options.ry;
        if (options.fill !== undefined) node.fill = options.fill;
        if (options.stroke !== undefined) node.stroke = options.stroke;
        if (options.opacity !== undefined) node.opacity = options.opacity;
        if (options.locked !== undefined) node.locked = options.locked;
        if (options.translation !== undefined) node.translation = options.translation;
    }
    return node;
}

export function createRectangle(options?: any): RectangleNode {
    const node = editor.createRectangle();
    if (options) {
        if (options.width !== undefined) node.width = options.width;
        if (options.height !== undefined) node.height = options.height;
        if (options.fill !== undefined) node.fill = options.fill;
        if (options.stroke !== undefined) node.stroke = options.stroke;
        if (options.opacity !== undefined) node.opacity = options.opacity;
        if (options.locked !== undefined) node.locked = options.locked;
        if (options.translation !== undefined) node.translation = options.translation;
    }
    return node;
}

export function createText(content?: string, options?: any): StandaloneTextNode {
    const node = editor.createText(content ?? "");
    if (options) {
        if (options.opacity !== undefined) node.opacity = options.opacity;
        if (options.locked !== undefined) node.locked = options.locked;
        if (options.translation !== undefined) node.translation = options.translation;
    }
    return node;
}

export function createLine(options?: any): LineNode {
    const node = editor.createLine();
    if (options) {
        if (options.startX !== undefined && options.startY !== undefined && options.endX !== undefined && options.endY !== undefined) {
            node.setEndPoints(options.startX, options.startY, options.endX, options.endY);
        }
        if (options.stroke !== undefined) node.stroke = options.stroke;
        if (options.opacity !== undefined) node.opacity = options.opacity;
        if (options.locked !== undefined) node.locked = options.locked;
        if (options.translation !== undefined) node.translation = options.translation;
    }
    return node;
}

export function createGroup(children?: any[]): GroupNode {
    const node = editor.createGroup();
    if (children) {
        node.children.append(...children);
    }
    return node;
}

export function createUser(options?: { userId?: string }): MockCurrentUser {
    const user = new MockCurrentUser();
    if (options?.userId) {
        user.__setUserId(options.userId);
    }
    return user;
}

export function createPremiumUser(options?: { userId?: string }): MockCurrentUser {
    const user = new MockCurrentUser();
    if (options?.userId) {
        user.__setUserId(options.userId);
    }
    user.__setIsPremiumUser(true);
    return user;
}

export function createAnonymousUser(): MockCurrentUser {
    const user = new MockCurrentUser();
    user.__setIsAnonymousUser(true);
    return user;
}
