/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function useCleanDescriptionText() {
  return (descriptionText: string) => {
    if (descriptionText.includes('\\n ')) {
      return descriptionText.replace('\\n', '');
    }

    if (descriptionText.includes('\\n')) {
      return descriptionText.replace('\\n', ' ');
    }

    return descriptionText;
  };
}
