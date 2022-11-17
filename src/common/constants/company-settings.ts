/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanySettingsTab } from 'common/enums/company-settings';
import DefaultLogo from '../../resources/images/invoiceninja-logo@light.png';

export default {
  logo: DefaultLogo,
};

export const CompanySettingsTabs = {
  [CompanySettingsTab.Details]: 'details',
  [CompanySettingsTab.Address]: 'address',
  [CompanySettingsTab.Logo]: 'logo',
  [CompanySettingsTab.Defaults]: 'defaults',
  [CompanySettingsTab.Documents]: 'documents',
  [CompanySettingsTab.Custom_Fields]: 'custom_fields',
};
