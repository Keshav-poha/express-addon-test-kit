import type {
    OAuth,
    AuthorizationRequest,
    AuthorizationResponse,
    AuthorizeWithOwnRedirectRequest,
    AuthorizationResult,
    AuthorizeInsideIframeRequest,
    AuthorizationStatus
} from "./types.js";

export class MockOAuth implements OAuth {
    private _nextResponse: AuthorizationResponse | null = null;
    private _nextResult: AuthorizationResult | null = null;
    private _nextFailure: { status: AuthorizationStatus, description: string } | null = null;

    __setNextResponse(response: AuthorizationResponse): void {
        this._nextResponse = response;
    }

    __setNextResult(result: AuthorizationResult): void {
        this._nextResult = result;
    }

    __setNextFailure(status: AuthorizationStatus, description: string): void {
        this._nextFailure = { status, description };
    }

    async authorize(request: AuthorizationRequest): Promise<AuthorizationResponse> {
        if (this._nextFailure) {
            const { status, description } = this._nextFailure;
            this._nextFailure = null;
            return {
                id: request.id,
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
            id: request.id,
            code: 'mock-code',
            redirectUri: 'https://mock.redirect/',
            result: {
                status: 'SUCCESS' as AuthorizationStatus,
                description: 'Authorized'
            }
        };
    }

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

    async authorizeInsideIframe(request: AuthorizeInsideIframeRequest): Promise<AuthorizationResponse> {
        // Shared logic with authorize()
        return this.authorize(request as unknown as AuthorizationRequest);
    }
}
