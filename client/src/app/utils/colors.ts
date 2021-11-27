import { ShapeStyle } from "../model/IAction.model";
import { FilledShape } from "../services/tools/tool-rectangle/filed-shape.model";

export const DEFAULT_RADIX = 10;
export const MAX_HEX_VALUE = 255;

export const fromRGB = (rgb: string): number[] => {
    return rgb
        .replace(/[^\d,]/g, "")
        .split(",")
        .map((v) => parseInt(v, DEFAULT_RADIX));
};

export const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export const fromOpacity = (opacity: string): number => {
    return Math.round(parseFloat(opacity) * MAX_HEX_VALUE);
};

export const fromAlpha = (alpha: number): string => {
    return (alpha / MAX_HEX_VALUE).toFixed(2);
};

export const toRGBString = (rgb: number[]): string => {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};

export const setStyle = (
    shape: FilledShape,
    primaryColor: string,
    primaryAlpha: string,
    secondaryColor: string,
    secondaryAlpha: string,
    shapeStyle: ShapeStyle
): void => {
    if (!shape) {
        return;
    }
    switch (shapeStyle) {
        case "center":
            shape.fill = primaryColor;
            shape.fillOpacity = primaryAlpha;
            shape.stroke = "none";
            shape.strokeOpacity = "none";
            break;

        case "border":
            shape.fill = "none";
            shape.fillOpacity = "none";
            shape.stroke = secondaryColor;
            shape.strokeOpacity = secondaryAlpha;
            break;

        case "fill":
            shape.fill = primaryColor;
            shape.fillOpacity = primaryAlpha;
            shape.stroke = secondaryColor;
            shape.strokeOpacity = secondaryAlpha;
            break;
    }
};
