import { TypedEventEmitter } from "./events.js";
import { MockUI } from "./ui.js";
import { MockDocument } from "./document.js";
import { MockOAuth } from "./oauth.js";
import { MockCurrentUser } from "./currentUser.js";
import type {
    Application,
    DragCallbacks,
    DragOptions,
    DisableDragToDocument,
    UnregisterIframe,
    AlertDialogOptions,
    AlertDialogResult,
    InputDialogOptions,
    InputDialogResult,
    CustomDialogOptions,
    CustomDialogResult,
    ColorPickerOptions,
    CurrentPlatformPayload,
    DevFlags,
    Command,
    DialogResult,
    AppThemeChangeEventData,
    AppLocaleChangeEventData,
    AppFormatChangeEventData,
    AppDragStartEventData,
    AppDragEndEventData,
    DocumentIdAvailableEventData,
    DocumentLinkAvailableEventData,
    DocumentTitleChangeEventData,
    DocumentExportAllowedChangeEventData
} from "./types.js";

/**
 * Fallback type for missing DocumentPublishedLinkAvailableEventData
 */
export interface DocumentPublishedLinkAvailableEventData {
    documentPublishedLink: string;
}

/**
 * Provides Type mappings between Events and their corresponding data delivered to the handler.
 */
export interface AppEventsTypeMap {
    themechange: AppThemeChangeEventData;
    localechange: AppLocaleChangeEventData;
    formatchange: AppFormatChangeEventData;
    reset: undefined;
    dragstart: AppDragStartEventData;
    dragend: AppDragEndEventData;
    dragcancel: undefined;

    documentIdAvailable: DocumentIdAvailableEventData;
    documentLinkAvailable: DocumentLinkAvailableEventData;
    documentPublishedLinkAvailable: DocumentPublishedLinkAvailableEventData;
    documentTitleChange: DocumentTitleChangeEventData;
    documentExportAllowedChange: DocumentExportAllowedChangeEventData;
}

/**
 * Mock implementation of the `Application` interface from `addOnUISdk`.
 * Extends `TypedEventEmitter` with the full SDK event map for type-safe `on`/`off`/`emit`.
 */
export class MockApplication extends TypedEventEmitter<AppEventsTypeMap> implements Application {
    public readonly ui: MockUI;
    public readonly document: MockDocument;
    public readonly oauth: MockOAuth;
    public readonly currentUser: MockCurrentUser;
    public readonly command: Command;
    public devFlags: DevFlags;

    /** Call-log for all methods invoked on this mock. Useful for test assertions. */
    public __calls = {
        enableDragToDocument: [] as { element: HTMLElement; dragCallbacks: DragCallbacks; dragOptions?: DragOptions | undefined }[],
        registerIframe: [] as { element: HTMLIFrameElement }[],
        showModalDialog: [] as { dialogOptions: AlertDialogOptions | InputDialogOptions | CustomDialogOptions }[],
        showColorPicker: [] as { anchorElement: HTMLElement; options?: ColorPickerOptions | undefined }[],
        hideColorPicker: [] as Record<string, never>[],
        startPremiumUpgradeIfFreeUser: [] as Record<string, never>[],
        getCurrentPlatform: [] as Record<string, never>[]
    };

    /** Configurable return values for mock methods. Override in tests as needed. */
    public __returns = {
        dialogResult: { type: "alert", buttonType: "cancel" } as DialogResult,
        premiumUpgradeResult: true,
        currentPlatform: {
            inAppPurchaseAllowed: false,
            platform: "chromeBrowser",
            environment: "web",
            deviceClass: "desktop"
        } as CurrentPlatformPayload
    };

    constructor() {
        super();
        this.ui = new MockUI();
        this.document = new MockDocument();
        this.oauth = new MockOAuth();
        this.currentUser = new MockCurrentUser();
        this.devFlags = {
            simulateFreeUser: false
        };
        this.command = {
            register: (_command: string, _handler: (params: Record<string, unknown>) => unknown): void => {
                // stub — command registration is a no-op in the mock
            }
        };
    }

    /**
     * Enables drag-to-document on the given element.
     *
     * @param element - The draggable element.
     * @param dragCallbacks - Preview and completion callbacks.
     * @param dragOptions - Optional drag configuration.
     * @returns A function that disables drag-to-document when called.
     */
    enableDragToDocument(
        element: HTMLElement,
        dragCallbacks: DragCallbacks,
        dragOptions?: DragOptions
    ): DisableDragToDocument {
        this.__calls.enableDragToDocument.push({ element, dragCallbacks, dragOptions });
        return () => {
            // no-op stub
        };
    }

    /**
     * Registers an iframe element with the SDK.
     *
     * @param element - The iframe to register.
     * @returns A function that unregisters the iframe when called.
     */
    registerIframe(element: HTMLIFrameElement): UnregisterIframe {
        this.__calls.registerIframe.push({ element });
        return () => {
            // no-op stub
        };
    }

    /** @override */
    async showModalDialog(dialogOptions: AlertDialogOptions): Promise<AlertDialogResult>;
    /** @override */
    async showModalDialog(dialogOptions: InputDialogOptions): Promise<InputDialogResult>;
    /** @override */
    async showModalDialog(dialogOptions: CustomDialogOptions): Promise<CustomDialogResult>;
    async showModalDialog(
        dialogOptions: AlertDialogOptions | InputDialogOptions | CustomDialogOptions
    ): Promise<AlertDialogResult | InputDialogResult | CustomDialogResult> {
        this.__calls.showModalDialog.push({ dialogOptions });
        return this.__returns.dialogResult as AlertDialogResult | InputDialogResult | CustomDialogResult;
    }

    /**
     * Shows a color picker anchored to `anchorElement`.
     *
     * @param anchorElement - The element to anchor the color picker to.
     * @param options - Color picker configuration.
     */
    async showColorPicker(anchorElement: HTMLElement, options?: ColorPickerOptions): Promise<void> {
        this.__calls.showColorPicker.push({ anchorElement, options });
    }

    /**
     * Hides the color picker if currently visible.
     */
    async hideColorPicker(): Promise<void> {
        this.__calls.hideColorPicker.push({});
    }

    /**
     * Triggers the premium upgrade flow.
     *
     * @returns `true` if the user is now a premium user.
     */
    async startPremiumUpgradeIfFreeUser(): Promise<boolean> {
        this.__calls.startPremiumUpgradeIfFreeUser.push({});
        return this.__returns.premiumUpgradeResult;
    }

    /**
     * Returns details about the current platform and environment.
     */
    async getCurrentPlatform(): Promise<CurrentPlatformPayload> {
        this.__calls.getCurrentPlatform.push({});
        return this.__returns.currentPlatform;
    }

    /** Sets the next dialog result returned by `showModalDialog`. */
    __setNextDialogResult(result: DialogResult): void {
        this.__returns.dialogResult = result;
    }

    /** Sets whether the next call to `startPremiumUpgradeIfFreeUser` returns true. */
    __setPremiumUpgradeResult(value: boolean): void {
        this.__returns.premiumUpgradeResult = value;
    }

    /** Sets the platform info returned by `getCurrentPlatform`. */
    __setCurrentPlatform(platform: CurrentPlatformPayload): void {
        this.__returns.currentPlatform = platform;
    }
}
