export class MockAvailableFont {
    public readonly postscriptName: string;
    public readonly family: string;
    public readonly style: string;
    public readonly isPremium = false;
    public readonly availableForEditing = true;

    constructor(postscriptName: string, family: string, style: string) {
        this.postscriptName = postscriptName;
        this.family = family;
        this.style = style;
    }
}

export class MockFonts {
    private registry = new Map<string, MockAvailableFont>();

    constructor() {
        this.__registerFont("ArialMT", "Arial", "Regular");
        this.__registerFont("Arial-BoldMT", "Arial", "Bold");
        this.__registerFont("Courier", "Courier", "Regular");
        this.__registerFont("Helvetica", "Helvetica", "Regular");
        this.__registerFont("Times-Roman", "Times New Roman", "Regular");
    }

    async fromPostscriptName(postscriptName: string): Promise<MockAvailableFont | undefined> {
        return this.registry.get(postscriptName);
    }

    __registerFont(postscriptName: string, family: string, style: string): void {
        this.registry.set(postscriptName, new MockAvailableFont(postscriptName, family, style));
    }

    __reset() {
        this.registry.clear();
        this.__registerFont("ArialMT", "Arial", "Regular");
        this.__registerFont("Arial-BoldMT", "Arial", "Bold");
        this.__registerFont("Courier", "Courier", "Regular");
        this.__registerFont("Helvetica", "Helvetica", "Regular");
        this.__registerFont("Times-Roman", "Times New Roman", "Regular");
    }
}

export const fonts = new MockFonts();
