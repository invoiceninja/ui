/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectField } from '@invoiceninja/forms';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { updateChanges } from 'common/stores/slices/company-users';
import { Divider } from 'components/cards/Divider';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

export function Invoices() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

  const handleToggleChange = (id: string, value: boolean | string) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );

  return (
    <Card title={t('invoices')}>
      <Element
        leftSide={t('auto_email_invoice')}
        leftSideHelp={t('auto_email_invoice_help')}
      >
        <Toggle
          checked={companyChanges?.settings?.auto_email_invoice || false}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_email_invoice', value)
          }
        />
      </Element>

      <Element
        leftSide={t('stop_on_unpaid')}
        leftSideHelp={t('stop_on_unpaid_help')}
      >
        <Toggle
          checked={companyChanges?.stop_on_unpaid_recurring || false}
          onChange={(value: boolean) =>
            handleToggleChange('stop_on_unpaid_recurring', value)
          }
        />
      </Element>


      <Divider />

      <Element
        leftSide={t('auto_archive_invoice')}
        leftSideHelp={t('auto_archive_invoice_help')}
      >
        <Toggle
          checked={companyChanges?.settings?.auto_archive_invoice || false}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_archive_invoice', value)
          }
        />
      </Element>

      <Element
        leftSide={t('auto_archive_invoice_cancelled')}
        leftSideHelp={t('auto_archive_invoice_cancelled_help')}
      >
        <Toggle
          checked={
            companyChanges?.settings?.auto_archive_invoice_cancelled || false
          }
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_archive_invoice_cancelled', value)
          }
        />
      </Element>

      <Divider />

      <Element leftSide={t('lock_invoices')}>
        <SelectField
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            handleToggleChange('settings.lock_invoices', event.target.value)
          }
          value={companyChanges?.settings?.lock_invoices || 'off'}
        >
          <option value="off">{t('off')}</option>
          <option value="when_sent">{t('when_sent')}</option>
          <option value="when_paid">{t('when_paid')}</option>
        </SelectField>
      </Element>
    </Card>
  );
}
