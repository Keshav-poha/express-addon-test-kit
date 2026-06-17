import { MockVisualNode } from "./scenegraph/VisualNode.js";

export class MockExpressViewport {
    public __calls = {
        bringIntoView: [] as MockVisualNode[]
    };

    bringIntoView(node: MockVisualNode): void {
        this.__calls.bringIntoView.push(node);
    }
}

export const viewport = new MockExpressViewport();
