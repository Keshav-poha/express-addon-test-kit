import { MockExpressRootNode } from "./ExpressRootNode.js";

export function createDefaultDocumentTree(): MockExpressRootNode {
    const root = new MockExpressRootNode();
    root.pages.addPage({ width: 800, height: 600 });
    return root;
}
