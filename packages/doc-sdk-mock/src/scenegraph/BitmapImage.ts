export class MockBitmapImage {
    public readonly width: number;
    public readonly height: number;
    private readonly blob: Blob;

    constructor(blob: Blob, width: number = 800, height: number = 600) {
        this.blob = blob;
        this.width = width;
        this.height = height;
    }

    async data(): Promise<Blob> {
        return this.blob;
    }
}
