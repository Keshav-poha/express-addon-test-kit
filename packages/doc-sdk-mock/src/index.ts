import { editor } from "./editor.js";
import { colorUtils } from "./colorUtils.js";
import { viewport } from "./viewport.js";
import { fonts } from "./fonts.js";
import * as constantsEnums from "./constants.js";

export { editor, colorUtils, viewport, fonts };

export const constants = constantsEnums;

export {
    ArrowHeadType,
    BlendMode,
    FillRule,
    FillType,
    SceneNodeType,
    StrokePosition,
    StrokeType,
    TextAlignment,
    TextLayout,
    TextScriptStyle,
    EditorEvent,
    VisualEffectType,
    TextStyleSource,
    ParagraphListType,
    OrderedListNumbering
} from "./constants.js";

export type { Color } from "./colorUtils.js";
export type { MockFill as Fill } from "./scenegraph/FillableNode.js";
export type { MockStroke as Stroke } from "./scenegraph/StrokableNode.js";
export type { StrokeOptions } from "./editor.js";

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
export { MockExpressEditor } from "./editor.js";
export { MockExpressContext } from "./context.js";

/**
 * Resets all doc-sdk-mock singletons to their initial state.
 * Call this in `afterEach` (or use `setupVitest()` which calls it automatically).
 */
export function __resetMockState(): void {
    editor.__resetMockState();
    fonts.__reset();
    viewport.__calls.bringIntoView = [];
}
