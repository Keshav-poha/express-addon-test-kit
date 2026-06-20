import type { UI, UiTheme, EditorPanel, PanelAction } from "./types.js";

/**
 * Mock implementation of the UI middleware.
 */
export class MockUI implements UI {
    private _locale: string = 'en-US';
    private _theme: UiTheme = 'light';
    private _format: string = 'en-US';
    private _locales: string[] = ['en-US'];

    public __calls = {
        openEditorPanel: [] as { panel: EditorPanel, action?: PanelAction | undefined }[]
    };

    get locale(): string {
        return this._locale;
    }

    get theme(): string {
        return this._theme;
    }

    get format(): string {
        return this._format;
    }

    get locales(): string[] {
        return this._locales;
    }

    openEditorPanel(panel: EditorPanel, action?: PanelAction): void {
        this.__calls.openEditorPanel.push({ panel, action });
    }

    __setLocale(locale: string): void {
        this._locale = locale;
    }

    __setTheme(theme: UiTheme): void {
        this._theme = theme;
    }

    __setFormat(format: string): void {
        this._format = format;
    }

    __setLocales(locales: string[]): void {
        this._locales = locales;
    }
}
