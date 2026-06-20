export enum ArrowHeadType {
    none = 0,
    triangularFilled = 7,
    openTriangular = 11,
    circleFilled = 21,
    squareFilled = 22,
    circleHollow = 24,
    squareHollow = 25,
    verticalLine = 27
}

export enum BlendMode {
    passThrough = 1,
    normal = 2,
    multiply = 3,
    darken = 4,
    colorBurn = 5,
    lighten = 6,
    screen = 7,
    colorDodge = 8,
    overlay = 9,
    softLight = 10,
    hardLight = 11,
    difference = 12,
    exclusion = 13,
    hue = 14,
    saturation = 15,
    color = 16,
    luminosity = 17,
    accumulate = 18
}

export enum FillRule {
    nonzero = "nonzero",
    evenodd = "evenodd"
}

export enum FillType {
    color = "color",
    image = "image"
}

export enum SceneNodeType {
    ellipse = "ellipse",
    rectangle = "rectangle",
    path = "path",
    line = "line",
    standaloneText = "standaloneText",
    group = "group",
    mediaContainer = "mediaContainer",
    artboard = "artboard",
    page = "page",
    expressRoot = "expressRoot"
}

export enum StrokePosition {
    center = "center",
    inside = "inside",
    outside = "outside"
}

export enum StrokeType {
    color = "color"
}

export enum TextAlignment {
    left = "left",
    center = "center",
    right = "right",
    justify = "justify"
}

export enum TextLayout {
    autoWidth = "autoWidth",
    autoHeight = "autoHeight",
    area = "area"
}

export enum TextScriptStyle {
    normal = "normal",
    superscript = "superscript",
    subscript = "subscript"
}

export enum EditorEvent {
    selectionChange = "selectionChange"
}

export enum VisualEffectType {
    shadow = "shadow"
}

export enum TextStyleSource {
    character = "character",
    paragraph = "paragraph"
}

export enum ParagraphListType {
    none = "none",
    bullet = "bullet",
    ordered = "ordered"
}

export enum OrderedListNumbering {
    arabic = "arabic",
    lowerAlpha = "lowerAlpha",
    upperAlpha = "upperAlpha",
    lowerRoman = "lowerRoman",
    upperRoman = "upperRoman"
}

export const MIN_DIMENSION = 1;
