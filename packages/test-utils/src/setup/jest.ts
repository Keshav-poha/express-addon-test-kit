export function getJestModuleNameMapper(): Record<string, string> {
    return {
        "^express-document-sdk$": "@express-addon-tests/doc-sdk-mock",
        "^addOnUISdk$": "@express-addon-tests/ui-sdk-mock"
    };
}

export function getJestSetupFile(): string {
    return "const { __resetMockState } = require('@express-addon-tests/doc-sdk-mock'); afterEach(() => { __resetMockState(); });";
}
