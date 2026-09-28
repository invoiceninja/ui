/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Contact {
  email: string;
}

export const hasContactWithEmail = (contacts: Contact[] | undefined) => {
  return Boolean(contacts?.some(({ email }) => email?.trim()));
};
