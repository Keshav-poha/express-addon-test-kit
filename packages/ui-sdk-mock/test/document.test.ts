import { describe, it, expect, beforeEach } from "vitest";
import { createMockAddOnUISdk } from "../src/index.js";

describe("MockDocument", () => {
    let sdk: ReturnType<typeof createMockAddOnUISdk>;

    beforeEach(async () => {
        sdk = createMockAddOnUISdk();
        await sdk.ready;
    });

    it("should record addImage calls and resolve", async () => {
        const blob = new Blob(["test"], { type: "image/png" });
        const attributes = { title: "Test Image" };
        
        await sdk.app.document.addImage(blob, attributes);
        
        expect(sdk.app.document.__calls.addImage).toHaveLength(1);
        expect(sdk.app.document.__calls.addImage[0]).toEqual({
            blob,
            attributes,
            importAddOnData: undefined
        });
    });

    it("should respect __setAsyncDelay for async methods", async () => {
        sdk.app.document.__setAsyncDelay(50);
        const start = Date.now();
        
        await sdk.app.document.id();
        
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(45);
    });

    it("should return configured renditions", async () => {
        const mockRenditions = [{ type: "page", blob: new Blob() }] as any;
        sdk.app.document.__returns.renditions = mockRenditions;

        const result = await sdk.app.document.createRenditions({ format: "image/png" } as any);
        expect(result).toBe(mockRenditions);
        expect(sdk.app.document.__calls.createRenditions).toHaveLength(1);
    });

    it("should record sync import calls", () => {
        const blob = new Blob(["test"], { type: "application/pdf" });
        const attrs = { title: "Doc", sourceMimeType: "docx" } as any;

        sdk.app.document.importPdf(blob, attrs);
        expect(sdk.app.document.__calls.importPdf).toHaveLength(1);
        expect(sdk.app.document.__calls.importPdf[0]).toEqual({ blob, attributes: attrs });
    });
});
