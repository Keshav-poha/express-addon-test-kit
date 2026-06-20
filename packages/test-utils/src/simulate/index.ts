import { AddOnSDKAPI, MockApplication } from "@express-addon-tests/ui-sdk-mock";
import { MockExpressContext, Node } from "@express-addon-tests/doc-sdk-mock";

/**
 * Helper to flush the microtask queue, allowing asynchronous event listeners to run.
 */
async function flushMicrotasks(): Promise<void> {
    await new Promise<void>(resolve => queueMicrotask(resolve));
    // A second microtask flush ensures any secondary microtasks (e.g. Comlink bridge handlers) also execute
    await new Promise<void>(resolve => queueMicrotask(resolve));
}

/**
 * Simulates a change in the application's locale.
 * Modifies the locale on the mock UI, emits the `localechange` event on the application,
 * and waits for listeners to complete.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param locale The new locale string (e.g., 'fr-FR', 'de-DE').
 */
export async function simulateLocaleChange(sdk: AddOnSDKAPI, locale: string): Promise<void> {
    const app = sdk.app as any;
    app.ui.__setLocale(locale);
    app.emit("localechange", { locale });
    await flushMicrotasks();
}

/**
 * Simulates a change in the application's UI theme.
 * Modifies the theme on the mock UI, emits the `themechange` event on the application,
 * and waits for listeners to complete.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param theme The new UI theme ('light', 'dark', etc.).
 */
export async function simulateThemeChange(sdk: AddOnSDKAPI, theme: "light" | "dark"): Promise<void> {
    const app = sdk.app as any;
    app.ui.__setTheme(theme);
    app.emit("themechange", { theme });
    await flushMicrotasks();
}

/**
 * Simulates a change in the application's regional format.
 * Modifies the format on the mock UI, emits the `formatchange` event on the application,
 * and waits for listeners to complete.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param format The new regional format string (e.g., 'en-US', 'fr-FR').
 */
export async function simulateFormatChange(sdk: AddOnSDKAPI, format: string): Promise<void> {
    const app = sdk.app as any;
    app.ui.__setFormat(format);
    app.emit("formatchange", { format });
    await flushMicrotasks();
}

/**
 * Simulates the active document selection changing in the Document Sandbox.
 * Mutates the selection on the editor context, triggering selectionChange handlers.
 * 
 * @param context The MockExpressContext instance.
 * @param selection The new selected node, array of nodes, or undefined.
 */
export async function simulateSelectionChange(
    context: MockExpressContext,
    selection: Node | readonly Node[] | undefined
): Promise<void> {
    context.selection = selection;
    await flushMicrotasks();
}

/**
 * Simulates the document ID becoming available in the host application.
 * Sets the mock document ID, emits the `documentIdAvailable` event, and waits for listeners.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param id The document ID.
 */
export async function simulateDocumentIdAvailable(sdk: AddOnSDKAPI, id: string): Promise<void> {
    const app = sdk.app as any;
    app.document.__returns.id = id;
    app.emit("documentIdAvailable", { id });
    await flushMicrotasks();
}

/**
 * Simulates the document link becoming available in the host application.
 * Sets the mock document link, emits the `documentLinkAvailable` event, and waits for listeners.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param link The document link.
 */
export async function simulateDocumentLinkAvailable(sdk: AddOnSDKAPI, link: string): Promise<void> {
    const app = sdk.app as any;
    app.document.__returns.link = link;
    app.emit("documentLinkAvailable", { link });
    await flushMicrotasks();
}

/**
 * Simulates the document's published link becoming available in the host application.
 * Sets the mock document link, emits the `documentPublishedLinkAvailable` event, and waits for listeners.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param link The published link.
 */
export async function simulateDocumentPublishedLinkAvailable(sdk: AddOnSDKAPI, link: string): Promise<void> {
    const app = sdk.app as any;
    app.document.__returns.link = link;
    app.emit("documentPublishedLinkAvailable", { documentPublishedLink: link });
    await flushMicrotasks();
}

/**
 * Simulates a change in the document title in the host application.
 * Sets the mock document title, emits the `documentTitleChange` event, and waits for listeners.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param title The new document title.
 */
export async function simulateDocumentTitleChange(sdk: AddOnSDKAPI, title: string): Promise<void> {
    const app = sdk.app as any;
    app.document.__returns.title = title;
    app.emit("documentTitleChange", { title });
    await flushMicrotasks();
}

/**
 * Simulates a change in whether document export is allowed (e.g. review and approval status).
 * Sets the mock export status, emits the `documentExportAllowedChange` event, and waits for listeners.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param exportAllowed Whether export is allowed.
 */
export async function simulateDocumentExportAllowedChange(sdk: AddOnSDKAPI, exportAllowed: boolean): Promise<void> {
    const app = sdk.app as any;
    app.document.__returns.exportAllowed = exportAllowed;
    app.emit("documentExportAllowedChange", { exportAllowed });
    await flushMicrotasks();
}

/**
 * Simulates the start of a drag-to-document action.
 * Emits the `dragstart` event on the application.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param element The HTML element being dragged.
 */
export async function simulateDragStart(sdk: AddOnSDKAPI, element: HTMLElement): Promise<void> {
    const app = sdk.app as any;
    app.emit("dragstart", { element });
    await flushMicrotasks();
}

/**
 * Simulates the completion of a drag-to-document action.
 * Emits the `dragend` event on the application.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param dropCancelled Whether the drop was cancelled.
 * @param element The HTML element that was dragged.
 * @param dropCancelReason The reason the drop was cancelled, if applicable.
 */
export async function simulateDragEnd(
    sdk: AddOnSDKAPI,
    dropCancelled: boolean,
    element: HTMLElement,
    dropCancelReason?: string
): Promise<void> {
    const app = sdk.app as any;
    app.emit("dragend", { dropCancelled, element, dropCancelReason });
    await flushMicrotasks();
}

/**
 * Simulates the cancellation of a drag-to-document action.
 * Emits the `dragcancel` event on the application.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 */
export async function simulateDragCancel(sdk: AddOnSDKAPI): Promise<void> {
    const app = sdk.app as any;
    app.emit("dragcancel", undefined);
    await flushMicrotasks();
}

/**
 * Configures the mock OAuth client to respond with a successful authorization token
 * on the next authorization call.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param code The mock authorization code to return.
 * @param redirectUri The mock redirect URI.
 */
export function setupOAuthMockSuccess(
    sdk: AddOnSDKAPI,
    code: string = "mock-code",
    redirectUri: string = "https://mock.redirect/"
): void {
    const app = sdk.app as any;
    app.oauth.__setNextResponse({
        id: "mock-auth-id",
        code,
        redirectUri,
        result: {
            status: "SUCCESS",
            description: "Authorized"
        }
    });
    app.oauth.__setNextResult({
        status: "SUCCESS",
        description: "Authorized"
    });
}

/**
 * Configures the mock OAuth client to respond with a failure status on the next authorization call.
 * 
 * @param sdk The Mock AddOnUISdk instance.
 * @param status The authorization status (e.g. 'FAILED', 'POPUP_CLOSED').
 * @param description The details or error descriptions of the failure.
 */
export function setupOAuthMockFailure(
    sdk: AddOnSDKAPI,
    status: string,
    description: string
): void {
    const app = sdk.app as any;
    app.oauth.__setNextFailure(status, description);
}
