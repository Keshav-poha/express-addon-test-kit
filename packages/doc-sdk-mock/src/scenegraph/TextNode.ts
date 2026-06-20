import { MockNode } from "./Node.js";
import { SceneNodeType } from "../constants.js";

export class MockTextContentModel {
    private _text: string = "";

    constructor(initialText: string = "") {
        this._text = initialText;
    }

    get text(): string {
        return this._text;
    }

    set text(val: string) {
        this._text = val;
    }
}

export class MockStandaloneTextNode extends MockNode {
    public readonly fullContent: MockTextContentModel;

    constructor(initialText: string = "") {
        super(SceneNodeType.standaloneText);
        this.fullContent = new MockTextContentModel(initialText);
    }

    get text(): string {
        return this.fullContent.text;
    }

    set text(val: string) {
        this.fullContent.text = val;
    }

    protected override _copySubclassProperties(clone: any): void {
        super._copySubclassProperties(clone);
        clone.fullContent.text = this.fullContent.text;
    }
}
