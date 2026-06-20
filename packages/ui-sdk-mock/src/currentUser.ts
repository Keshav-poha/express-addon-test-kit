import type { CurrentUser } from "./types.js";

/**
 * Mock implementation of the CurrentUser middleware.
 */
export class MockCurrentUser implements CurrentUser {
    private _userId: string = 'mock-user-id';
    private _isPremiumUser: boolean = false;
    private _isAnonymousUser: boolean = false;

    async userId(): Promise<string> {
        return this._userId;
    }

    async isPremiumUser(): Promise<boolean> {
        return this._isPremiumUser;
    }

    async isAnonymousUser(): Promise<boolean> {
        return this._isAnonymousUser;
    }

    __setUserId(id: string): void {
        this._userId = id;
    }

    __setIsPremiumUser(value: boolean): void {
        this._isPremiumUser = value;
    }

    __setIsAnonymousUser(value: boolean): void {
        this._isAnonymousUser = value;
    }
}
