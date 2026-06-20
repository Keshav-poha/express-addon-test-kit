declare const afterEach: (fn: () => void | Promise<void>) => void;
import { __resetMockState as resetDoc } from "@express-addon-tests/doc-sdk-mock";
import addOnUISdk from "@express-addon-tests/ui-sdk-mock";

/**
 * Returns the `moduleNameMapper` configuration required for Jest to redirect
 * Adobe SDK imports to the mock implementations.
 * 
 * Merge this into your `jest.config.js`.
 */
export function getJestModuleNameMapper(): Record<string, string> {
    return {
        "^express-document-sdk$": "@express-addon-tests/doc-sdk-mock",
        "^https://express\\.adobe\\.com/static/add-on-sdk/sdk\\.js$": "@express-addon-tests/ui-sdk-mock"
    };
}

/**
 * Registers global Jest hooks for the Express Add-on Test Kit.
 * This ensures that mock state is completely reset between tests.
 * 
 * Call this function inside your Jest `setupFilesAfterEnv` script.
 */
export function setupJest(): void {
    afterEach(() => {
        resetDoc();
        if (addOnUISdk && typeof (addOnUISdk as any).__controls?.resetAll === "function") {
            (addOnUISdk as any).__controls.resetAll();
        }
    });
}
