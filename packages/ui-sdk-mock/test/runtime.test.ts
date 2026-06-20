import { describe, it, expect, beforeEach } from "vitest";
import { createMockAddOnUISdk } from "../src/index.js";

describe("MockRuntime and ClientStorage", () => {
    let sdk: ReturnType<typeof createMockAddOnUISdk>;

    beforeEach(async () => {
        sdk = createMockAddOnUISdk();
        await sdk.ready;
    });

    it("should have correct runtime type and expose/proxy API in standalone mode", async () => {
        const runtime = sdk.instance.runtime;
        expect(runtime.type).toBe("panel");

        const testApi = { sayHello: () => "world" };
        runtime.exposeApi(testApi);

        const proxy = await runtime.apiProxy<{ sayHello: () => Promise<string> }>("panel" as any);
        expect(await proxy.sayHello()).toBe("world");
    });

    it("should perform ClientStorage operations correctly", async () => {
        const storage = sdk.instance.clientStorage;
        
        await storage.setItem("foo", "bar");
        expect(await storage.getItem("foo")).toBe("bar");
        
        expect(await storage.keys()).toEqual(["foo"]);
        
        await storage.removeItem("foo");
        expect(await storage.getItem("foo")).toBeUndefined();
        
        await storage.setItem("a", 1);
        await storage.setItem("b", 2);
        await storage.clear();
        expect(await storage.keys()).toEqual([]);
    });

    it("should allow resetting mock state via resetAll", async () => {
        const storage = sdk.instance.clientStorage;
        await storage.setItem("foo", "bar");

        sdk.__controls.resetAll();

        expect(await storage.keys()).toEqual([]);
    });
});
