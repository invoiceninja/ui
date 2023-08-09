/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const hexToRGB = (hex: string) => {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const red = parseInt(hex.substring(0, 2), 16);
  const green = parseInt(hex.substring(2, 4), 16);
  const blue = parseInt(hex.substring(4, 6), 16);

  return { red, green, blue, hex: `#${hex}` };
};

export const isColorLight = (red: number, green: number, blue: number) => {
  return red + green + blue > 384;
};

export function useAdjustColorDarkness() {
  return (color: string, amount: number) => {
    const initialColorHex = color.replace(/^#/, '');

    const updatedColorHex = initialColorHex.replace(/../g, (colorSubstring) => {
      const updatedColorSubstring =
        '0' +
        Math.min(
          255,
          Math.max(0, parseInt(colorSubstring, 16) + amount)
        ).toString(16);

      const subStringLength = updatedColorSubstring.length;

      return updatedColorSubstring.substring(
        subStringLength - 2,
        subStringLength
      );
    });

    return '#' + updatedColorHex;
  };
}
