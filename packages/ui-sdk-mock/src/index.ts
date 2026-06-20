import { MockApplication } from "./app.js";
import { MockRuntime } from "./runtime.js";
import { MockClientStorage } from "./clientStorage.js";
import { SDKNotReadyError } from "./errors.js";
import type { AddOnSDKAPI, Application, EntrypointType } from "./types.js";

export { SDKNotReadyError, UnknownRuntimeError } from "./errors.js";
export { MockApplication } from "./app.js";
export { MockRuntime } from "./runtime.js";
export { MockUI } from "./ui.js";
export { MockDocument } from "./document.js";
export { MockOAuth } from "./oauth.js";
export { MockCurrentUser } from "./currentUser.js";
export { MockClientStorage } from "./clientStorage.js";

export type { AddOnSDKAPI };

export const AppEvent = {
    themechange: "themechange",
    localechange: "localechange",
    formatchange: "formatchange",
    reset: "reset",
    dragstart: "dragstart",
    dragend: "dragend",
    dragcancel: "dragcancel",
    documentIdAvailable: "documentIdAvailable",
    documentLinkAvailable: "documentLinkAvailable",
    documentPublishedLinkAvailable: "documentPublishedLinkAvailable",
    documentTitleChange: "documentTitleChange",
    documentExportAllowedChange: "documentExportAllowedChange"
} as const;

export const Constants = {
    Range: {
        currentPage: "currentPage",
        entireDocument: "entireDocument",
        specificPages: "specificPages"
    },
    LinkOptions: {
        document: "document",
        published: "published"
    },
    RenditionFormat: {
        png: "image/png",
        jpg: "image/jpeg",
        mp4: "video/mp4",
        pdf: "application/pdf",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    },
    RenditionType: {
        page: "page"
    },
    RenditionIntent: {
        export: "export",
        preview: "preview",
        print: "print"
    },
    Variant: {
        confirmation: "confirmation",
        information: "information",
        warning: "warning",
        destructive: "destructive",
        error: "error",
        input: "input",
        custom: "custom"
    },
    FieldType: {
        text: "text"
    },
    DialogResultType: {
        alert: "alert",
        input: "input",
        custom: "custom"
    },
    ButtonType: {
        primary: "primary",
        secondary: "secondary",
        cancel: "cancel",
        close: "close"
    },
    RuntimeType: {
        panel: "panel",
        dialog: "dialog",
        script: "script",
        documentSandbox: "documentSandbox",
        command: "command"
    },
    BleedUnit: {
        Inch: "in",
        Millimeter: "mm"
    },
    VideoResolution: {
        sd480p: "480p",
        hd720p: "720p",
        fhd1080p: "1080p",
        qhd1440p: "1440p",
        uhd2160p: "2160p",
        custom: "custom"
    },
    FrameRate: {
        fps23_976: 23.976,
        fps24: 24,
        fps25: 25,
        fps29_97: 29.97,
        fps30: 30,
        fps60: 60
    },
    BitRate: {
        mbps4: 4000000,
        mbps8: 8000000,
        mbps10: 10000000,
        mbps12: 12000000,
        mbps15: 15000000,
        mbps25: 25000000,
        mbps50: 50000000
    },
    EditorPanel: {
        search: "search",
        yourStuff: "yourStuff",
        templates: "templates",
        media: "media",
        text: "text",
        elements: "elements",
        grids: "grids",
        brands: "brands",
        addOns: "addOns"
    },
    MediaTabs: {
        video: "video",
        audio: "audio",
        photos: "photos"
    },
    ElementsTabs: {
        designAssets: "designAssets",
        backgrounds: "backgrounds",
        shapes: "shapes",
        stockIcons: "stockIcons",
        charts: "charts"
    },
    PanelActionType: {
        search: "search",
        navigate: "navigate"
    },
    PlatformEnvironment: {
        app: "app",
        web: "web"
    },
    DeviceClass: {
        mobile: "mobile",
        tablet: "tablet",
        desktop: "desktop"
    },
    PlatformType: {
        iOS: "ios",
        iPadOS: "ipad",
        chromeOS: "chromeOS",
        android: "android",
        chromeBrowser: "chromeBrowser",
        firefoxBrowser: "firefoxBrowser",
        edgeBrowser: "edgeBrowser",
        samsungBrowser: "samsumgBrowser",
        safariBrowser: "safariBrowser",
        unknown: "unknown"
    },
    ColorPickerPlacement: {
        top: "top",
        bottom: "bottom",
        left: "left",
        right: "right"
    },
    FileSizeLimitUnit: {
        KB: "KB",
        MB: "MB"
    },
    AuthorizationStatus: {
        SUCCESS: "SUCCESS",
        POPUP_OPENED: "POPUP_OPENED",
        POPUP_BLOCKED: "POPUP_BLOCKED",
        POPUP_CLOSED: "POPUP_CLOSED",
        POPUP_TIMEOUT: "POPUP_TIMEOUT",
        FAILED: "FAILED",
        IFRAME_LOAD_FAILED: "IFRAME_LOAD_FAILED"
    }
} as unknown as typeof import("./types.js").Constants;

/**
 * Options for configuring the mock AddOnUISdk.
 */
export interface MockAddOnUISdkOptions {
    /**
     * Mock manifest.json contents.
     */
    manifest?: Record<string, unknown>;
    /**
     * Entrypoint type under which the addon is loaded (e.g. 'panel', 'dialog').
     */
    entrypointType?: string;
    /**
     * Delay in milliseconds before the sdk.ready promise resolves (default: 0).
     */
    readyDelayMs?: number;
}

/**
 * Interface defining the test-specific controls available on the mock SDK.
 */
export interface MockSDKControls {
    /** The raw, unproxied application mock instance. Useful for synchronous setup in tests before ready resolves. */
    app: MockApplication;
    /** Sets the delay before sdk.ready resolves, applicable only before ready is awaited. */
    delayReady(ms: number): void;
    /** Sets a simulated async delay for document operations. */
    setAsyncDelay(ms: number): void;
    /** Resets all mock states, configurations, and call logs to their initial state. */
    resetAll(): void;
}

/**
 * Instantiates a mock Express UI SDK object (`addOnUISdk`).
 * Simulates asynchronous connection readiness and routes calls to in-process stubs.
 * 
 * @param options Initial configuration options.
 * @returns A mock implementation of AddOnSDKAPI along with test `__controls` to simulate system states.
 */
export function createMockAddOnUISdk(options?: MockAddOnUISdkOptions): AddOnSDKAPI & { __controls: MockSDKControls } {
    let isReady = false;
    let readyDelayMs = options?.readyDelayMs ?? 0;
    let resolveReadyPromise: (() => void) | null = null;
    
    let readyPromise = new Promise<void>((resolve) => {
        resolveReadyPromise = resolve;
    });

    if (readyDelayMs > 0) {
        setTimeout(() => {
            isReady = true;
            resolveReadyPromise?.();
        }, readyDelayMs);
    }

    queueMicrotask(() => {
        if (!isReady && readyDelayMs === 0) {
            isReady = true;
            resolveReadyPromise?.();
        }
    });

    const appInstance = new MockApplication();
    const runtimeInstance = new MockRuntime();
    const clientStorageInstance = new MockClientStorage();

    const appProxy = new Proxy(appInstance, {
        get(target, prop, receiver) {
            if (!isReady && prop !== "then" && prop !== "catch") {
                throw new SDKNotReadyError();
            }
            return Reflect.get(target, prop, receiver);
        }
    }) as unknown as Application;

    const sdk = {
        apiVersion: "1.0.0",
        get ready() {
            return readyPromise;
        },
        app: appProxy,
        instance: {
            runtime: runtimeInstance,
            manifest: options?.manifest ?? {},
            clientStorage: clientStorageInstance,
            entrypointType: (options?.entrypointType ?? "panel") as EntrypointType
        },
        constants: Constants,
        __controls: {
            get app() {
                return appInstance;
            },
            delayReady(ms: number) {
                readyDelayMs = ms;
            },
            setAsyncDelay(ms: number) {
                appInstance.document.__setAsyncDelay(ms);
            },
            resetAll() {
                isReady = false;
                readyDelayMs = 0;
                readyPromise = new Promise<void>((resolve) => {
                    resolveReadyPromise = resolve;
                });
                queueMicrotask(() => {
                    if (!isReady && readyDelayMs === 0) {
                        isReady = true;
                        resolveReadyPromise?.();
                    }
                });
                appInstance.removeAllListeners();
                appInstance.ui.__setLocale('en-US');
                appInstance.ui.__setTheme('light');
                appInstance.ui.__setFormat('en-US');
                appInstance.ui.__setLocales(['en-US']);
                appInstance.ui.__calls.openEditorPanel = [];
                appInstance.__calls.enableDragToDocument = [];
                appInstance.__calls.registerIframe = [];
                appInstance.__calls.showModalDialog = [];
                appInstance.__calls.showColorPicker = [];
                appInstance.__calls.hideColorPicker = [];
                appInstance.__calls.startPremiumUpgradeIfFreeUser = [];
                appInstance.__calls.getCurrentPlatform = [];
                appInstance.document.__calls.addImage = [];
                appInstance.document.__calls.addAnimatedImage = [];
                appInstance.document.__calls.addVideo = [];
                appInstance.document.__calls.addAudio = [];
                appInstance.document.__calls.createRenditions = [];
                appInstance.document.__calls.getPagesMetadata = [];
                appInstance.document.__calls.getSelectedPageIds = [];
                appInstance.document.__calls.id = [];
                appInstance.document.__calls.title = [];
                appInstance.document.__calls.link = [];
                appInstance.document.__calls.exportAllowed = [];
                appInstance.document.__calls.importPdf = [];
                appInstance.document.__calls.importPresentation = [];
                appInstance.document.__calls.runPrintQualityCheck = [];
                appInstance.document.__setAsyncDelay(0);
                appInstance.oauth.__reset();
                appInstance.currentUser.__setUserId('mock-user-id');
                appInstance.currentUser.__setIsPremiumUser(false);
                appInstance.currentUser.__setIsAnonymousUser(false);
                clientStorageInstance.__reset();
            }
        }
    };

    return sdk;
}
