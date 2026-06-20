# `@express-addon-tests`

> **Express Add-on Test Kit** — A production-quality monorepo designed for testing Express add-ons in dual-runtime environments (Iframe UI and Document Sandbox) directly in Node.js/jsdom environments (e.g., using Vitest or Jest).

Testing Adobe Express add-ons historically required complex end-to-end setups (like Playwright or Puppeteer) or writing manual stubs for every single SDK method. Because the real `addOnUISdk` and `express-document-sdk` are not available in a pure Node.js environment, developers struggle to write fast, reliable unit and integration tests. `@express-addon-tests` solves this problem by providing high-fidelity, in-process, synchronous mocks, factories, event simulators, and a mock RPC bridge that links the runtimes together.

---

## Overview

Express Add-ons operate across two distinct runtimes:
1. **Iframe UI Runtime**: The visual interface running in an iframe, interacting with the host via `addOnUISdk`.
2. **Document Sandbox Runtime**: The headless javascript sandbox executing edits on the Express scenegraph via `express-document-sdk`.

### Architecture

```text
+-------------------------+                           +-------------------------+
|     Iframe UI Runtime   |                           | Document Sandbox Runtime|
|  (React/Vue/Vanilla UI) |                           |    (Scenegraph Edits)   |
+-------------------------+                           +-------------------------+
|       addOnUISdk        |       test-bridge         |   express-document-sdk  |
|  (ui-sdk-mock stubbed)  | <-----------------------> | (doc-sdk-mock stubbed)  |
+-------------------------+        (Comlink)          +-------------------------+
```

---

## Monorepo Packages

The monorepo contains four decoupled, highly cohesive packages:

| Package | Purpose |
| :--- | :--- |
| [`@express-addon-tests/ui-sdk-mock`](#) | An in-process mock of `addOnUISdk`, with support for full event propagation (`on`/`off`), oauth, currentUser, and clientStorage. |
| [`@express-addon-tests/doc-sdk-mock`](#) | High-fidelity mock of the document scenegraph (`Rectangle`, `Ellipse`, `TextNode`, etc.), `editor`, `viewport`, and `fonts` APIs. |
| [`@express-addon-tests/test-bridge`](#) | Simulates the RPC message boundary between the iframe and sandbox runtimes using Promisified ES Proxies. |
| [`@express-addon-tests/test-utils`](#) | Factories for document structure, event simulators, and boilerplate test setup helpers for Jest and Vitest. |

---

## Installation

Install the packages in your add-on project:

```bash
npm install --save-dev @express-addon-tests/ui-sdk-mock @express-addon-tests/doc-sdk-mock @express-addon-tests/test-bridge @express-addon-tests/test-utils
```

---

## Getting Started

### 1. Test Runner Configuration (Vitest / Jest)

Initialize the environment variables and mock global objects required by the SDK before running your tests.

#### Using Vitest
In your `vitest.config.ts`, include the alias resolutions:
```typescript
import { defineConfig } from "vitest/config";
import { getVitestConfig } from "@express-addon-tests/test-utils/setup/vitest";

export default defineConfig({
    test: {
        setupFiles: ["./test-setup.ts"]
    },
    ...getVitestConfig()
});
```

And in your `test-setup.ts`:
```typescript
import { setupVitest } from "@express-addon-tests/test-utils/setup/vitest";

// Register hooks to clear mock state after each test
setupVitest();
```

---

### 2. Simulating User and UI Events

Use factories and simulation helpers to mock user states, UI modifications, and document events.

```typescript
import { createDocument, simulateLocaleChange, simulateSelectionChange } from "@express-addon-tests/test-utils";

it("should respond to locale changes in the UI", async () => {
    const { sdk } = createDocument();
    await sdk.ready;

    let currentLocale = sdk.app.ui.locale;
    sdk.app.on("localechange", ({ locale }) => {
        currentLocale = locale;
    });

    // Simulate change from en-US to fr-FR
    await simulateLocaleChange(sdk, "fr-FR");

    expect(currentLocale).toBe("fr-FR");
    expect(sdk.app.ui.locale).toBe("fr-FR");
});
```

---

### 3. Testing Scenegraph Mutations (Document Sandbox)

Mutate and verify nodes using `editor` and factories:

```typescript
import { createDocument, createRectangle, createEllipse } from "@express-addon-tests/test-utils";

it("should insert shapes and modify properties", async () => {
    const { editor, root } = createDocument();
    
    // Create new rectangle
    const rect = createRectangle({
        width: 100,
        height: 150,
        opacity: 0.8
    });

    // Append to active artboard
    editor.context.insertionParent.children.append(rect);

    expect(editor.context.insertionParent.children.length).toBe(1);
    expect(rect.width).toBe(100);
    expect(rect.opacity).toBe(0.8);
});
```

---

### 4. Cross-Runtime Testing (Bridge)

Test the complete flow between your Iframe UI (sending requests) and Document Sandbox (processing edits).

```typescript
import { createBridge } from "@express-addon-tests/test-bridge";
import { createDocument } from "@express-addon-tests/test-utils";
import { editor } from "@express-addon-tests/doc-sdk-mock";

// 1. Define your Sandbox APIs
const sandboxApi = {
    async createCircleAndSelect(radius: number) {
        const circle = editor.createEllipse();
        circle.rx = radius;
        circle.ry = radius;
        editor.context.insertionParent.children.append(circle);
        editor.context.selection = circle;
        return circle.id;
    }
};

it("should coordinate edits from Iframe through the bridge", async () => {
    const { sdk } = createDocument();
    await sdk.ready;

    // 2. Instantiate bridge linking iframe mock & sandbox API
    const { iframeRuntime, sandboxRuntime } = createBridge();
    
    // Wire up implementations
    sandboxRuntime.exposeApi(sandboxApi);
    sdk.instance.runtime.exposeApi(sandboxApi); // Normally, the UI runtime exposes its own UI API if needed

    // 3. Iframe calls Remote API (wrapped inside Promisified Proxy)
    const remoteSandbox = await iframeRuntime.apiProxy<typeof sandboxApi>("documentSandbox");
    const circleId = await remoteSandbox.createCircleAndSelect(40);

    // 4. Assert sandbox state
    expect(circleId).toBeDefined();
    expect(editor.context.selection[0]?.id).toBe(circleId);
});
```

---

## Known Gaps (How Mocks Differ From Real SDK)

While `@express-addon-tests` provides a very high-fidelity mock, it is a synchronous Node.js environment simulation.
Be aware of the following differences:
- **Geometry and Layout**: The mock scenegraph does not implement a full 2D layout engine. Calling `boundsInNode` or complex transformation logic will yield approximate or un-rotated bounds.
- **Asynchronous Operations**: In the real Express environment, most `editor.queueAsyncEdit` operations invoke WASM-backed engines and occur asynchronously across message boundaries. In the mock, mutations happen via simple microtask queuing or even synchronously if test controls dictate.
- **Node Validation**: The real SDK throws errors if properties are set out of bounds for the particular node type in complex ways. The mock validates basic ranges (like opacity 0-1) but may allow structurally invalid scenegraphs to be formed during tests.

---

## API Reference

### Event Simulators (`@express-addon-tests/test-utils/simulate`)

* `simulateLocaleChange(sdk, locale)` — Fires `"localechange"` event on `app`.
* `simulateThemeChange(sdk, theme)` — Fires `"themechange"` event on `app`.
* `simulateFormatChange(sdk, format)` — Fires `"formatchange"` event on `app`.
* `simulateSelectionChange(context, selection)` — Fires `"selectionChange"` event on Sandbox editor context.
* `simulateDocumentIdAvailable(sdk, id)` — Emits `"documentIdAvailable"` on `app`.
* `simulateDocumentTitleChange(sdk, title)` — Emits `"documentTitleChange"` on `app`.
* `simulateDocumentExportAllowedChange(sdk, exportAllowed)` — Emits `"documentExportAllowedChange"` on `app`.
* `simulateDragStart(sdk, element)` / `simulateDragEnd(sdk, dropCancelled, element)` — Simulate drag-to-document interactions.
* `setupOAuthMockSuccess(sdk, code, redirectUri)` / `setupOAuthMockFailure(sdk, status, description)` — Configure subsequent OAuth requests to succeed or fail.

### Factories (`@express-addon-tests/test-utils/factories`)

* `createDocument(options?)` — Returns `{ sdk, editor, root }` preconfigured.
* `createRectangle(options?)` — Instantiates a `MockRectangleNode` with layout and opacity settings.
* `createEllipse(options?)` — Instantiates a `MockEllipseNode`.
* `createText(content, options?)` — Instantiates a `MockStandaloneTextNode`.
* `createLine(options?)` — Instantiates a `MockLineNode`.
* `createUser(options?)` / `createPremiumUser(options?)` / `createAnonymousUser()` — Instantiates current user mocks.

---

## License

MIT © Copyright 2026. All rights reserved.
