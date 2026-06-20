import { afterEach } from "vitest";
import { __resetMockState as resetDoc } from "@express-addon-tests/doc-sdk-mock";
import addOnUISdk, { MockSDKControls } from "@express-addon-tests/ui-sdk-mock";

/**
 * Registers global Vitest hooks for the Express Add-on Test Kit.
 * This ensures that mock state is completely reset between tests.
 */
export function setupVitest(): void {
    afterEach(() => {
        resetDoc();
        const sdk = addOnUISdk as unknown as { __controls?: MockSDKControls };
        if (sdk && typeof sdk.__controls?.resetAll === "function") {
            sdk.__controls.resetAll();
        }
    });
}

/**
 * Returns a partial Vitest configuration object containing the necessary alias resolutions
 * to redirect Adobe SDK imports to the mock implementations.
 * 
 * Merge this into your `vitest.config.ts`.
 */
export function getVitestConfig(): { resolve: { alias: Record<string, string> } } {
    return {
        resolve: {
            alias: {
                "express-document-sdk": "@express-addon-tests/doc-sdk-mock",
                "https://express.adobe.com/static/add-on-sdk/sdk.js": "@express-addon-tests/ui-sdk-mock"
            }
        }
    };
}
