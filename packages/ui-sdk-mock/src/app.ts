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
    DialogResult
} from "./types.js";

export class MockApplication extends TypedEventEmitter<any> implements Application {
    public readonly ui: MockUI;
    public readonly document: MockDocument;
    public readonly oauth: MockOAuth;
    public readonly currentUser: MockCurrentUser;
    public readonly command: Command;
    public devFlags: DevFlags;

    public __calls = {
        enableDragToDocument: [] as { element: HTMLElement, dragCallbacks: DragCallbacks, dragOptions?: DragOptions | undefined }[],
        registerIframe: [] as { element: HTMLIFrameElement }[],
        showModalDialog: [] as { dialogOptions: AlertDialogOptions | InputDialogOptions | CustomDialogOptions }[],
        showColorPicker: [] as { anchorElement: HTMLElement, options?: ColorPickerOptions | undefined }[],
        hideColorPicker: [] as {}[],
        startPremiumUpgradeIfFreeUser: [] as {}[],
        getCurrentPlatform: [] as {}[]
    };

    public __returns = {
        dialogResult: { type: 'alert', buttonType: 'cancel' } as DialogResult,
        premiumUpgradeResult: true,
        currentPlatform: {
            inAppPurchaseAllowed: false,
            platform: 'chromeBrowser',
            environment: 'web',
            deviceClass: 'desktop'
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
            register: (command: string, handler: (params: Record<string, unknown>) => unknown): void => {
                // stub
            }
        };
    }

    enableDragToDocument(
        element: HTMLElement,
        dragCallbacks: DragCallbacks,
        dragOptions?: DragOptions
    ): DisableDragToDocument {
        this.__calls.enableDragToDocument.push({ element, dragCallbacks, dragOptions });
        return () => {
            // disable drag callback stub
        };
    }

    registerIframe(element: HTMLIFrameElement): UnregisterIframe {
        this.__calls.registerIframe.push({ element });
        return () => {
            // unregister iframe callback stub
        };
    }

    async showModalDialog(dialogOptions: AlertDialogOptions): Promise<AlertDialogResult>;
    async showModalDialog(dialogOptions: InputDialogOptions): Promise<InputDialogResult>;
    async showModalDialog(dialogOptions: CustomDialogOptions): Promise<CustomDialogResult>;
    async showModalDialog(
        dialogOptions: AlertDialogOptions | InputDialogOptions | CustomDialogOptions
    ): Promise<any> {
        this.__calls.showModalDialog.push({ dialogOptions });
        return this.__returns.dialogResult;
    }

    async showColorPicker(anchorElement: HTMLElement, options?: ColorPickerOptions): Promise<void> {
        this.__calls.showColorPicker.push({ anchorElement, options });
    }

    async hideColorPicker(): Promise<void> {
        this.__calls.hideColorPicker.push({});
    }

    async startPremiumUpgradeIfFreeUser(): Promise<boolean> {
        this.__calls.startPremiumUpgradeIfFreeUser.push({});
        return this.__returns.premiumUpgradeResult;
    }

    async getCurrentPlatform(): Promise<CurrentPlatformPayload> {
        this.__calls.getCurrentPlatform.push({});
        return this.__returns.currentPlatform;
    }

    __setNextDialogResult(result: DialogResult): void {
        this.__returns.dialogResult = result;
    }

    __setPremiumUpgradeResult(value: boolean): void {
        this.__returns.premiumUpgradeResult = value;
    }

    __setCurrentPlatform(platform: CurrentPlatformPayload): void {
        this.__returns.currentPlatform = platform;
    }
}
