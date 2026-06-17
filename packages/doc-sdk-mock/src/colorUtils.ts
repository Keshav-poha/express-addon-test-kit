export class MockColorUtils {
    fromRGB(redOrObj: number | { red: number, green: number, blue: number, alpha?: number }, green?: number, blue?: number, alpha?: number): any {
        if (typeof redOrObj === "object") {
            const r = redOrObj.red;
            const g = redOrObj.green;
            const b = redOrObj.blue;
            const a = redOrObj.alpha ?? 1.0;
            this._validate(r, g, b, a);
            return { red: r, green: g, blue: b, alpha: a };
        } else {
            const r = redOrObj;
            const g = green ?? 0;
            const b = blue ?? 0;
            const a = alpha ?? 1.0;
            this._validate(r, g, b, a);
            return { red: r, green: g, blue: b, alpha: a };
        }
    }

    private _validate(r: number, g: number, b: number, a: number) {
        if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1) {
            throw new RangeError("Color channels must be in the range [0, 1].");
        }
    }

    fromHex(hex: string): any {
        let cleanHex = hex.trim();
        if (cleanHex.startsWith("#")) {
            cleanHex = cleanHex.substring(1);
        }

        if (cleanHex.length !== 6 && cleanHex.length !== 8) {
            throw new Error("Invalid hex color");
        }

        const rByte = parseInt(cleanHex.substring(0, 2), 16);
        const gByte = parseInt(cleanHex.substring(2, 4), 16);
        const bByte = parseInt(cleanHex.substring(4, 6), 16);
        let aByte = 255;
        if (cleanHex.length === 8) {
            aByte = parseInt(cleanHex.substring(6, 8), 16);
        }

        if (isNaN(rByte) || isNaN(gByte) || isNaN(bByte) || isNaN(aByte)) {
            throw new Error("Invalid hex color");
        }

        return {
            red: rByte / 255,
            green: gByte / 255,
            blue: bByte / 255,
            alpha: aByte / 255
        };
    }

    toHex(color: { red: number, green: number, blue: number, alpha: number }): string {
        const rByte = Math.round(color.red * 255);
        const gByte = Math.round(color.green * 255);
        const bByte = Math.round(color.blue * 255);
        const aByte = Math.round(color.alpha * 255);

        const rHex = rByte.toString(16).padStart(2, "0");
        const gHex = gByte.toString(16).padStart(2, "0");
        const bHex = bByte.toString(16).padStart(2, "0");
        const aHex = aByte.toString(16).padStart(2, "0");

        return `#${rHex}${gHex}${bHex}${aHex}`.toLowerCase();
    }
}

export const colorUtils = new MockColorUtils();
