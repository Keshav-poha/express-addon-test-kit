import { MockApplication } from "./app.js";
import { MockRuntime } from "./runtime.js";
import { MockClientStorage } from "./clientStorage.js";
import { SDKNotReadyError } from "./errors.js";
import type { AddOnSDKAPI } from "./types.js";

export { SDKNotReadyError, UnknownRuntimeError } from "./errors.js";
export { MockApplication } from "./app.js";
export { MockRuntime } from "./runtime.js";
export { MockUI } from "./ui.js";
export { MockDocument } from "./document.js";
export { MockOAuth } from "./oauth.js";
export { MockCurrentUser } from "./currentUser.js";
export { MockClientStorage } from "./clientStorage.js";

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
} as any;

export interface MockAddOnUISdkOptions {
    manifest?: Record<string, unknown>;
    entrypointType?: string;
    readyDelayMs?: number;
}

export function createMockAddOnUISdk(options?: MockAddOnUISdkOptions): AddOnSDKAPI & { __controls: any } {
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
    });

    const sdk = {
        apiVersion: "1.0.0",
        get ready() {
            return readyPromise;
        },
        set ready(promise: Promise<void>) {
            readyPromise = promise;
        },
        app: appProxy as any,
        instance: {
            runtime: runtimeInstance,
            manifest: options?.manifest ?? {},
            clientStorage: clientStorageInstance,
            entrypointType: (options?.entrypointType ?? "panel") as any
        },
        constants: Constants,
        __controls: {
            delayReady(ms: number) {
                readyDelayMs = ms;
                if (ms > 0) {
                    setTimeout(() => {
                        isReady = true;
                        resolveReadyPromise?.();
                    }, ms);
                }
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
                appInstance.oauth.__setNextResponse(null as any);
                appInstance.oauth.__setNextResult(null as any);
                appInstance.oauth.__setNextFailure(null as any, null as any);
                appInstance.currentUser.__setUserId('mock-user-id');
                appInstance.currentUser.__setIsPremiumUser(false);
                appInstance.currentUser.__setIsAnonymousUser(false);
                clientStorageInstance.__reset();
            }
        }
    };

    return sdk;
}
