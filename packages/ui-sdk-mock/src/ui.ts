import type { UI, UiTheme } from "./types.js";

export class MockUI implements UI {
    private _locale: string = 'en-US';
    private _theme: UiTheme = 'light';

    get locale(): string {
        return this._locale;
    }

    get theme(): UiTheme {
        return this._theme;
    }

    __setLocale(locale: string): void {
        this._locale = locale;
    }

    __setTheme(theme: UiTheme): void {
        this._theme = theme;
    }
}
