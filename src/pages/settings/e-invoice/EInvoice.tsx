/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Settings } from '$app/components/layouts/Settings';
import { useState } from 'react';
import {
  Country,
  EInvoiceGenerator,
} from '$app/components/e-invoice/EInvoiceGenerator';
import { Card, Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';

export type EInvoiceType = {
  [key: string]: EInvoiceType;
};
export function EInvoice() {
  const [t] = useTranslation();

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('e_invoice'), href: '/settings/e_invoice' },
  ];

  const [country, setCountry] = useState<Country>();

  return (
    <Settings
      title={t('e_invoice')}
      docsLink="en/advanced-settings/#e_invoice"
      breadcrumbs={pages}
      onSaveClick={() => console.log('ok')}
      onCancelClick={() => console.log('ok')}
      disableSaveButton={showPlanAlert}
      withoutBackButton
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <Card title={t('e_invoice')}>
        <Element leftSide={t('country')}>
          <SelectField
            value={country || ''}
            onValueChange={(value) => setCountry(value as Country)}
            withBlank
          >
            <option value="italy">Italy</option>
          </SelectField>
        </Element>

        <EInvoiceGenerator country={country} />
      </Card>
    </Settings>
  );
}
