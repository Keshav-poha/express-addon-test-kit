import type { CurrentUser } from "./types.js";

export class MockCurrentUser implements CurrentUser {
    private _id: string = 'mock-user-id';
    private _locale: string = 'en-US';

    id(): string {
        return this._id;
    }

    locale(): string {
        return this._locale;
    }

    __setId(id: string): void {
        this._id = id;
    }

    __setLocale(locale: string): void {
        this._locale = locale;
    }
}
