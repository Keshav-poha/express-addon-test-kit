import { createMockAddOnUISdk, MockCurrentUser, AddOnSDKAPI } from "@express-addon-tests/ui-sdk-mock";
import {
    editor,
    EllipseNode,
    RectangleNode,
    StandaloneTextNode,
    LineNode,
    GroupNode,
    MockExpressEditor,
    ExpressRootNode,
    Node,
    Fill,
    Stroke
} from "@express-addon-tests/doc-sdk-mock";

export interface EllipseOptions {
    rx: number;
    ry: number;
    fill: Fill;
    stroke: Stroke;
    opacity: number;
    locked: boolean;
    translation: { x: number; y: number };
}

export interface RectangleOptions {
    width: number;
    height: number;
    fill: Fill;
    stroke: Stroke;
    opacity: number;
    locked: boolean;
    translation: { x: number; y: number };
}

export interface TextOptions {
    opacity: number;
    locked: boolean;
    translation: { x: number; y: number };
}

export interface LineOptions {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    stroke: Stroke;
    opacity: number;
    locked: boolean;
    translation: { x: number; y: number };
}

export function createDocument(options?: { pagesCount?: number; locale?: string; theme?: string }): {
    sdk: AddOnSDKAPI & { __controls: any };
    editor: MockExpressEditor;
    root: ExpressRootNode;
} {
    const sdk = createMockAddOnUISdk({
        entrypointType: "panel"
    }) as AddOnSDKAPI & { __controls: any };
    
    // Set locale and theme synchronously to avoid race conditions in tests.
    // In a real addon, these are available when ready resolves.
    if (options?.locale) {
        // We cast app to any to access internal __setLocale which is available on the proxy target MockApplication
        // Note: app is MockApplication but typed as Application by the proxy
        (sdk.app as any).ui.__setLocale(options.locale);
    }
    if (options?.theme) {
        (sdk.app as any).ui.__setTheme(options.theme as any);
    }

    const root = editor.documentRoot;
    const pagesCount = options?.pagesCount ?? 1;
    for (let i = 1; i < pagesCount; i++) {
        root.pages.addPage();
    }

    return { sdk, editor, root };
}

export function createEllipse(options?: Partial<EllipseOptions>): EllipseNode {
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

export function createRectangle(options?: Partial<RectangleOptions>): RectangleNode {
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

export function createText(content?: string, options?: Partial<TextOptions>): StandaloneTextNode {
    const node = editor.createText(content ?? "");
    if (options) {
        if (options.opacity !== undefined) node.opacity = options.opacity;
        if (options.locked !== undefined) node.locked = options.locked;
        if (options.translation !== undefined) node.translation = options.translation;
    }
    return node;
}

export function createLine(options?: Partial<LineOptions>): LineNode {
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

export function createGroup(children?: Node[]): GroupNode {
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
