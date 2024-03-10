/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SettingsLevel } from '$app/common/enums/settings';
import { Guard } from '../Guard';

export function companySettings(): Guard {
  return ({ settingsLevel }) =>
    Promise.resolve(Boolean(settingsLevel === SettingsLevel.Company));
}
