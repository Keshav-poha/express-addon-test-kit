import type {
    Document,
    MediaAttributes,
    ImportAddOnData,
    RenditionOptions,
    RenditionIntent,
    Rendition,
    PageMetadataOptions,
    PageMetadata,
    LinkOptions,
    SourceMimeTypeInfo,
    PrintQualityCheckOptions
} from "./types.js";

/**
 * Mock implementation of the Document middleware.
 */
export class MockDocument implements Document {
    public __calls = {
        addImage: [] as { blob: Blob, attributes?: MediaAttributes | undefined, importAddOnData?: ImportAddOnData | undefined }[],
        addAnimatedImage: [] as { blob: Blob, attributes?: MediaAttributes | undefined, importAddOnData?: ImportAddOnData | undefined }[],
        addVideo: [] as { blob: Blob, attributes?: MediaAttributes | undefined, importAddOnData?: ImportAddOnData | undefined }[],
        addAudio: [] as { blob: Blob, attributes: MediaAttributes }[],
        createRenditions: [] as { renditionOptions: RenditionOptions, renditionIntent?: RenditionIntent | undefined }[],
        getPagesMetadata: [] as { options: PageMetadataOptions }[],
        getSelectedPageIds: [] as {}[],
        id: [] as {}[],
        title: [] as {}[],
        link: [] as { options: LinkOptions }[],
        exportAllowed: [] as {}[],
        importPdf: [] as { blob: Blob, attributes: MediaAttributes & SourceMimeTypeInfo }[],
        importPresentation: [] as { blob: Blob, attributes: MediaAttributes }[],
        runPrintQualityCheck: [] as { options: PrintQualityCheckOptions }[]
    };

    private _delayMs: number = 0;
    
    public __returns = {
        renditions: [] as Rendition[],
        pagesMetadata: [] as PageMetadata[],
        selectedPageIds: [] as string[],
        id: 'mock-doc-id' as string | undefined,
        title: 'Mock Document',
        link: 'https://mock.link' as string | undefined,
        exportAllowed: true
    };

    private async delay(): Promise<void> {
        if (this._delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, this._delayMs));
        } else {
            await Promise.resolve();
        }
    }

    __setAsyncDelay(ms: number): void {
        this._delayMs = ms;
    }

    async addImage(blob: Blob, attributes?: MediaAttributes, importAddOnData?: ImportAddOnData): Promise<void> {
        this.__calls.addImage.push({ blob, attributes, importAddOnData });
        await this.delay();
    }

    async addAnimatedImage(blob: Blob, attributes?: MediaAttributes, importAddOnData?: ImportAddOnData): Promise<void> {
        this.__calls.addAnimatedImage.push({ blob, attributes, importAddOnData });
        await this.delay();
    }

    async addVideo(blob: Blob, attributes?: MediaAttributes, importAddOnData?: ImportAddOnData): Promise<void> {
        this.__calls.addVideo.push({ blob, attributes, importAddOnData });
        await this.delay();
    }

    async addAudio(blob: Blob, attributes: MediaAttributes): Promise<void> {
        this.__calls.addAudio.push({ blob, attributes });
        await this.delay();
    }

    async createRenditions(renditionOptions: RenditionOptions, renditionIntent?: RenditionIntent): Promise<Rendition[]> {
        this.__calls.createRenditions.push({ renditionOptions, renditionIntent });
        await this.delay();
        return this.__returns.renditions;
    }

    async getPagesMetadata(options: PageMetadataOptions): Promise<PageMetadata[]> {
        this.__calls.getPagesMetadata.push({ options });
        await this.delay();
        return this.__returns.pagesMetadata;
    }

    async getSelectedPageIds(): Promise<string[]> {
        this.__calls.getSelectedPageIds.push({});
        await this.delay();
        return this.__returns.selectedPageIds;
    }

    async id(): Promise<string | undefined> {
        this.__calls.id.push({});
        await this.delay();
        return this.__returns.id;
    }

    async title(): Promise<string> {
        this.__calls.title.push({});
        await this.delay();
        return this.__returns.title;
    }

    async link(options: LinkOptions): Promise<string | undefined> {
        this.__calls.link.push({ options });
        await this.delay();
        return this.__returns.link;
    }

    async exportAllowed(): Promise<boolean> {
        this.__calls.exportAllowed.push({});
        await this.delay();
        return this.__returns.exportAllowed;
    }

    importPdf(blob: Blob, attributes: MediaAttributes & SourceMimeTypeInfo): void {
        this.__calls.importPdf.push({ blob, attributes });
    }

    importPresentation(blob: Blob, attributes: MediaAttributes): void {
        this.__calls.importPresentation.push({ blob, attributes });
    }

    runPrintQualityCheck(options: PrintQualityCheckOptions): void {
        this.__calls.runPrintQualityCheck.push({ options });
    }

    __reset(): void {
        this._delayMs = 0;
        this.__calls = {
            addImage: [],
            addAnimatedImage: [],
            addVideo: [],
            addAudio: [],
            createRenditions: [],
            getPagesMetadata: [],
            getSelectedPageIds: [],
            id: [],
            title: [],
            link: [],
            exportAllowed: [],
            importPdf: [],
            importPresentation: [],
            runPrintQualityCheck: []
        };
        this.__returns = {
            renditions: [],
            pagesMetadata: [],
            selectedPageIds: [],
            id: 'mock-doc-id',
            title: 'Mock Document',
            link: 'https://mock.link',
            exportAllowed: true
        };
    }
}
