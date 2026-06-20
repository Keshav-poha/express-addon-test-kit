/**
 * An RGBA color value. All channels are in the range [0, 1].
 */
export interface Color {
    /** Red channel, 0–1. */
    red: number;
    /** Green channel, 0–1. */
    green: number;
    /** Blue channel, 0–1. */
    blue: number;
    /** Alpha channel, 0–1. Defaults to 1 (fully opaque). */
    alpha: number;
}

/**
 * Utility singleton for creating and converting color values.
 * Mirrors the `colorUtils` singleton from `express-document-sdk`.
 */
export class MockColorUtils {
    /**
     * Creates a `Color` from individual RGBA components, each in the range [0, 1].
     *
     * @param red - Red channel (0–1).
     * @param green - Green channel (0–1).
     * @param blue - Blue channel (0–1).
     * @param alpha - Alpha channel (0–1). Defaults to `1`.
     * @returns A `Color` object.
     * @throws `RangeError` if any channel is outside [0, 1].
     * @example
     * const red = colorUtils.fromRGB(1, 0, 0);
     */
    fromRGB(red: number, green: number, blue: number, alpha: number = 1.0): Color {
        this._validate(red, green, blue, alpha);
        return { red, green, blue, alpha };
    }

    /**
     * Creates a `Color` from a CSS hex string in `#RRGGBB` or `#RRGGBBAA` format.
     *
     * @param hex - Hex color string, with or without leading `#`.
     * @returns A `Color` object with channels normalized to [0, 1].
     * @throws `Error` if the hex string is not a valid 6- or 8-digit hex color.
     * @example
     * const blue = colorUtils.fromHex('#0000ff');
     */
    fromHex(hex: string): Color {
        let clean = hex.trim();
        if (clean.startsWith("#")) {
            clean = clean.substring(1);
        }

        if (clean.length !== 6 && clean.length !== 8) {
            throw new Error(`Invalid hex color: "${hex}". Expected #RRGGBB or #RRGGBBAA.`);
        }

        const rByte = parseInt(clean.substring(0, 2), 16);
        const gByte = parseInt(clean.substring(2, 4), 16);
        const bByte = parseInt(clean.substring(4, 6), 16);
        let aByte = 255;
        if (clean.length === 8) {
            aByte = parseInt(clean.substring(6, 8), 16);
        }

        if (isNaN(rByte) || isNaN(gByte) || isNaN(bByte) || isNaN(aByte)) {
            throw new Error(`Invalid hex color: "${hex}". Contains non-hex characters.`);
        }

        return {
            red: rByte / 255,
            green: gByte / 255,
            blue: bByte / 255,
            alpha: aByte / 255
        };
    }

    /**
     * Converts a `Color` to a lowercase `#rrggbbaa` hex string.
     *
     * @param color - The color to convert.
     * @returns An 8-character hex color string with `#` prefix.
     * @example
     * colorUtils.toHex({ red: 1, green: 0, blue: 0, alpha: 1 }); // '#ff0000ff'
     */
    toHex(color: Color): string {
        const rHex = Math.round(color.red * 255).toString(16).padStart(2, "0");
        const gHex = Math.round(color.green * 255).toString(16).padStart(2, "0");
        const bHex = Math.round(color.blue * 255).toString(16).padStart(2, "0");
        const aHex = Math.round(color.alpha * 255).toString(16).padStart(2, "0");
        return `#${rHex}${gHex}${bHex}${aHex}`;
    }

    __resetMockState(): void {
        // stateless singleton, no-op reset
    }

    private _validate(r: number, g: number, b: number, a: number): void {
        if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1) {
            throw new RangeError("Color channels must be in the range [0, 1].");
        }
    }
}

/** Singleton instance matching the `express-document-sdk` export. */
export const colorUtils = new MockColorUtils();
