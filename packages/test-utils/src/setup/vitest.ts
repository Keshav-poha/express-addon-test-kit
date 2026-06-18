import { afterEach } from "vitest";
import { __resetMockState as resetDoc } from "@express-addon-tests/doc-sdk-mock";

export function setupVitest(): void {
    afterEach(() => {
        try {
            resetDoc();
        } catch (_) {}
    });
}

export function getVitestAliases(): Record<string, string> {
    return {
        "express-document-sdk": "@express-addon-tests/doc-sdk-mock",
        "addOnUISdk": "@express-addon-tests/ui-sdk-mock"
    };
}
