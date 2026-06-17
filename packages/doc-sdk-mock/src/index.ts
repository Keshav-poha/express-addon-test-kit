import { editor } from "./editor.js";
import { colorUtils } from "./colorUtils.js";
import { viewport } from "./viewport.js";
import { fonts } from "./fonts.js";
import * as constantsEnums from "./constants.js";

export { editor } from "./editor.js";
export { colorUtils } from "./colorUtils.js";
export { viewport } from "./viewport.js";
export { fonts } from "./fonts.js";

export const constants = constantsEnums;

export { MockBaseNode as BaseNode } from "./scenegraph/BaseNode.js";
export { MockVisualNode as VisualNode } from "./scenegraph/VisualNode.js";
export { MockNode as Node } from "./scenegraph/Node.js";
export { MockStrokableNode as StrokableNode } from "./scenegraph/StrokableNode.js";
export { MockFillableNode as FillableNode } from "./scenegraph/FillableNode.js";
export { MockEllipseNode as EllipseNode } from "./scenegraph/EllipseNode.js";
export { MockRectangleNode as RectangleNode } from "./scenegraph/RectangleNode.js";
export { MockPathNode as PathNode } from "./scenegraph/PathNode.js";
export { MockLineNode as LineNode } from "./scenegraph/LineNode.js";
export { MockStandaloneTextNode as StandaloneTextNode } from "./scenegraph/TextNode.js";
export { MockGroupNode as GroupNode } from "./scenegraph/GroupNode.js";
export { MockMediaContainerNode as MediaContainerNode } from "./scenegraph/MediaContainerNode.js";
export { MockBitmapImage as BitmapImage } from "./scenegraph/BitmapImage.js";
export { MockArtboardNode as ArtboardNode } from "./scenegraph/ArtboardNode.js";
export { MockPageNode as PageNode } from "./scenegraph/PageNode.js";
export { MockExpressRootNode as ExpressRootNode } from "./scenegraph/ExpressRootNode.js";

export function __resetMockState() {
    editor.__resetMockState();
    fonts.__reset();
    viewport.__calls.bringIntoView = [];
}
