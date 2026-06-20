import type {
    OAuth,
    AuthorizationRequest,
    AuthorizationResponse,
    AuthorizeWithOwnRedirectRequest,
    AuthorizationResult,
    AuthorizeInsideIframeRequest,
    AuthorizationStatus
} from "./types.js";

/**
 * Mock implementation of the OAuth middleware.
 * Provides controls for simulating authorization success, failure, and different popup/iframe behaviors.
 */
export class MockOAuth implements OAuth {
    private _nextResponse: AuthorizationResponse | null = null;
    private _nextResult: AuthorizationResult | null = null;
    private _nextFailure: { status: AuthorizationStatus; description: string } | null = null;

    /**
     * Forces the next call to `authorize()` or `authorizeInsideIframe()` to return the specified response.
     * Consumed after one call.
     */
    __setNextResponse(response: AuthorizationResponse): void {
        this._nextResponse = response;
    }

    /**
     * Forces the next call to `authorizeWithOwnRedirect()` to return the specified result.
     * Consumed after one call.
     */
    __setNextResult(result: AuthorizationResult): void {
        this._nextResult = result;
    }

    /**
     * Forces the next authorization request to return a failure status.
     * Consumed after one call.
     */
    __setNextFailure(status: AuthorizationStatus, description: string): void {
        this._nextFailure = { status, description };
    }

    /**
     * Resets any configured next responses or failures to null.
     */
    __reset(): void {
        this._nextResponse = null;
        this._nextResult = null;
        this._nextFailure = null;
    }

    /**
     * Simulates the standard PKCE authorization flow.
     */
    async authorize(request: AuthorizationRequest): Promise<AuthorizationResponse> {
        if (this._nextFailure) {
            const { status, description } = this._nextFailure;
            this._nextFailure = null;
            return {
                id: 'mock-auth-id',
                code: '',
                redirectUri: '',
                result: { status, description }
            };
        }
        
        if (this._nextResponse) {
            const res = this._nextResponse;
            this._nextResponse = null;
            return res;
        }

        // Default successful response
        return {
            id: 'mock-auth-id',
            code: 'mock-code',
            redirectUri: 'https://mock.redirect/',
            result: {
                status: 'SUCCESS' as AuthorizationStatus,
                description: 'Authorized'
            }
        };
    }

    /**
     * Simulates the authorization flow where the add-on manages the redirect.
     */
    async authorizeWithOwnRedirect(request: AuthorizeWithOwnRedirectRequest): Promise<AuthorizationResult> {
        if (this._nextFailure) {
            const { status, description } = this._nextFailure;
            this._nextFailure = null;
            return { status, description };
        }
        
        if (this._nextResult) {
            const res = this._nextResult;
            this._nextResult = null;
            return res;
        }

        // Default successful result
        return {
            status: 'SUCCESS' as AuthorizationStatus,
            description: 'Authorized'
        };
    }

    /**
     * Simulates the iframe-based authorization flow.
     */
    async authorizeInsideIframe(request: AuthorizeInsideIframeRequest): Promise<AuthorizationResponse> {
        // Shared logic with authorize()
        return this.authorize(request);
    }
}
