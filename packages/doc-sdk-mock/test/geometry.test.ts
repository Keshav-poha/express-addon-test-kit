import { describe, it, expect, beforeEach } from "vitest";
import { editor, __resetMockState } from "../src/index.js";
import { BlendMode } from "../src/constants.js";

describe("Geometry & Strict Edit Mode", () => {
    beforeEach(() => {
        __resetMockState();
    });

    it("should compute correct boundsInParent and boundsInNode under rotation", () => {
        const rect = editor.createRectangle();
        rect.width = 100;
        rect.height = 100;
        rect.translation = { x: 50, y: 50 };

        // With 0 rotation, boundsInParent matches translation and size
        expect(rect.boundsInParent).toEqual({ x: 50, y: 50, width: 100, height: 100 });

        // Rotate by 90 degrees (Math.PI / 2)
        rect.rotation = 90;
        const boundsRotated = rect.boundsInParent;
        
        // 90 deg rotation around local (0,0) (top-left)
        // Corners: (0,0) -> (50,50)
        // (100,0) -> (50, 150)
        // (0,100) -> (-50, 50)
        // (100,100) -> (-50, 150)
        // So minX = -50, maxX = 50, minY = 50, maxY = 150
        expect(boundsRotated.x).toBeCloseTo(-50);
        expect(boundsRotated.y).toBeCloseTo(50);
        expect(boundsRotated.width).toBeCloseTo(100);
        expect(boundsRotated.height).toBeCloseTo(100);
    });

    it("should transform coordinates across hierarchy correctly using localPointInNode", () => {
        const artboard = editor.context.insertionParent;
        const rect1 = editor.createRectangle();
        rect1.translation = { x: 10, y: 20 };
        artboard.children.append(rect1);

        const rect2 = editor.createRectangle();
        rect2.translation = { x: 30, y: 40 };
        artboard.children.append(rect2);

        // Transform (0, 0) from rect1 to rect2 space
        // (0,0) in rect1 is (10, 20) in artboard
        // (10, 20) in artboard is (-20, -20) in rect2
        const pt = rect1.localPointInNode({ x: 0, y: 0 }, rect2);
        expect(pt.x).toBeCloseTo(-20);
        expect(pt.y).toBeCloseTo(-20);
    });

    it("should keep the pivot point stationary during setRotationInParent", () => {
        const rect = editor.createRectangle();
        rect.translation = { x: 100, y: 100 };
        rect.rotation = 0;

        const pivot = { x: 150, y: 150 };
        
        // Rotate 90 degrees around pivot (150, 150)
        rect.setRotationInParent(90, pivot);

        // Old pivot transform: R_old = 0, T_old = (100, 100).
        // Pivot point (150, 150) in parent corresponds to local point:
        // (150 - 100, 150 - 100) = (50, 50).
        // Under new rotation of 90 degrees around (0,0) (in parent space relative to T_new):
        // (50, 50) local rotated by 90 degrees is: (-50, 50).
        // New translation should be: P - rotated_local = (150 - (-50), 150 - 50) = (200, 100).
        expect(rect.rotation).toBe(90);
        expect(rect.translation.x).toBeCloseTo(200);
        expect(rect.translation.y).toBeCloseTo(100);

        // Verify that the pivot point in local space transforms back to the same parent coordinate
        const ptInParent = rect.localPointInNode({ x: 50, y: 50 }, editor.context.insertionParent);
        expect(ptInParent.x).toBeCloseTo(150);
        expect(ptInParent.y).toBeCloseTo(150);
    });

    it("should enforce strict edit mode locking", async () => {
        const rect = editor.createRectangle();
        const artboard = editor.context.insertionParent;
        artboard.children.append(rect);

        // Turn on strict edit mode
        editor.__controls.strictEditMode = true;

        // Mutating a property of an attached node outside queueAsyncEdit should throw
        expect(() => {
            rect.opacity = 0.5;
        }).toThrow(/Mutation failed/);

        // Inside queueAsyncEdit, it should succeed
        await editor.queueAsyncEdit(() => {
            rect.opacity = 0.5;
        });
        expect(rect.opacity).toBe(0.5);

        // Mutating an unattached node should succeed even in strict mode
        const unattached = editor.createRectangle();
        unattached.opacity = 0.8;
        expect(unattached.opacity).toBe(0.8);
    });
});
