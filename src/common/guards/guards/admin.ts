/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from '../Guard';

export function admin(): Guard {
  return ({ companyUser }) => Promise.resolve(Boolean(companyUser?.is_admin));
}

export function owner(): Guard {
  return ({ companyUser }) => Promise.resolve(Boolean(companyUser?.is_owner));
}
