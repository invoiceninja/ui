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
import { useEffect, useRef, useState } from 'react';
import { EInvoiceGenerator } from '$app/components/e-invoice/EInvoiceGenerator';
import { Card, Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';

export type EInvoiceType = {
  [key: string]: string | number | EInvoiceType;
};

export interface EInvoiceComponent {
  saveEInvoice: () => EInvoiceType | undefined;
}
export function EInvoice() {
  const [t] = useTranslation();

  const eInvoiceRef = useRef<EInvoiceComponent>(null);

  const onSave = useHandleCompanySave();
  const disableSettingsField = useDisableSettingsField();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const company = useInjectCompanyChanges();
  const showPlanAlert = useShouldDisableAdvanceSettings();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('e_invoice'), href: '/settings/e_invoice' },
  ];

  const [isInitial, setIsInitial] = useState<boolean>(true);

  useEffect(() => {
    if (!isInitial) {
      onSave();
    } else {
      setIsInitial(false);
    }
  }, [company?.e_invoice]);

  return (
    <Settings
      title={t('e_invoice')}
      docsLink="en/advanced-settings/#e_invoice"
      breadcrumbs={pages}
      onSaveClick={() =>
        eInvoiceRef?.current?.saveEInvoice() &&
        handleChange('e_invoice', eInvoiceRef?.current?.saveEInvoice())
      }
      disableSaveButton={showPlanAlert}
      withoutBackButton
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <Card title={t('e_invoice')}>
        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="e_invoice_type"
              labelElement={<SettingsLabel label={t('e_invoice_type')} />}
              defaultValue="EN16931"
            />
          }
        >
          <SelectField
            value={company?.settings.e_invoice_type || 'EN16931'}
            onValueChange={(value) =>
              handleChange('settings.e_invoice_type', value)
            }
            disabled={disableSettingsField('e_invoice_type')}
          >
            <option value="FACT1">FACT1</option>
            <option value="EN16931">EN16931</option>
            <option value="XInvoice_3_0">XInvoice_3.0</option>
            <option value="XInvoice_2_3">XInvoice_2.3</option>
            <option value="XInvoice_2_2">XInvoice_2.2</option>
            <option value="XInvoice_2_1">XInvoice_2.1</option>
            <option value="XInvoice_2_0">XInvoice_2.0</option>
            <option value="XInvoice_1_0">XInvoice_1.0</option>
            <option value="XInvoice-Extended">XInvoice-Extended</option>
            <option value="XInvoice-BasicWL">XInvoice-BasicWL</option>
            <option value="XInvoice-Basic">XInvoice-Basic</option>
            <option value="Facturae_3.2.2">Facturae_3.2.2</option>
            <option value="Facturae_3.2.1">Facturae_3.2.1</option>
            <option value="Facturae_3.2">Facturae_3.2</option>
            <option value="FatturaPA">FatturaPA</option>
          </SelectField>
        </Element>

        <EInvoiceGenerator
          ref={eInvoiceRef}
          country={'italy'}
          currentEInvoice={company?.e_invoice || {}}
        />
      </Card>
    </Settings>
  );
}
