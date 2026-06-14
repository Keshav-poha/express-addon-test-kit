import { TypedEventEmitter } from "./events.js";
import { MockUI } from "./ui.js";
import { MockDocument } from "./document.js";
import { MockOAuth } from "./oauth.js";
import { MockCurrentUser } from "./currentUser.js";
import type { ApplicationBase } from "./types.js";

export class MockApplication extends TypedEventEmitter<any> implements ApplicationBase {
    public ui: MockUI;
    public document: MockDocument;
    public oauth: MockOAuth;
    public currentUser: MockCurrentUser;

    constructor() {
        super();
        this.ui = new MockUI();
        this.document = new MockDocument();
        this.oauth = new MockOAuth();
        this.currentUser = new MockCurrentUser();
    }
}
