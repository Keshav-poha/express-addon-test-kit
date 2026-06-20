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

    // Mock implementations for styling and layout APIs
    characterStyleRanges(): Iterable<any> { return []; }
    applyCharacterStyles(styles: any, start?: number, end?: number): void { /* no-op */ }
    
    paragraphStyleRanges(): Iterable<any> { return []; }
    applyParagraphStyles(styles: any, start?: number, end?: number): void { /* no-op */ }

    appendText(text: string): void { this._text += text; }
    insertText(text: string, index: number): void {
        this._text = this._text.substring(0, index) + text + this._text.substring(index);
    }
    replaceText(text: string, start: number, end: number): void {
        this._text = this._text.substring(0, start) + text + this._text.substring(end);
    }
    deleteText(start: number, end: number): void {
        this._text = this._text.substring(0, start) + this._text.substring(end);
    }
}

export class MockStandaloneTextNode extends MockNode {
    public readonly fullContent: MockTextContentModel;
    public layout: any = { type: "autoWidth" };

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
        clone.layout = { ...this.layout };
    }
}
