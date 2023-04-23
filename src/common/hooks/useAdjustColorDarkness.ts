/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
