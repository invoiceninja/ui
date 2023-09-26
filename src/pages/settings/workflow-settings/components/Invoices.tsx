/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectField } from '$app/components/forms';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { Divider } from '$app/components/cards/Divider';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';

export function Invoices() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

  const disableSettingsField = useDisableSettingsField();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const errors = useAtomValue(companySettingsErrorsAtom);

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
        leftSide={
          <PropertyCheckbox
            propertyKey="auto_email_invoice"
            labelElement={
              <SettingsLabel
                label={t('auto_email_invoice')}
                helpLabel={t('auto_email_invoice_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(companyChanges?.settings?.auto_email_invoice)}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_email_invoice', value)
          }
          disabled={disableSettingsField('auto_email_invoice')}
        />
      </Element>

      {isCompanySettingsActive && (
        <Element
          leftSide={t('stop_on_unpaid')}
          leftSideHelp={t('stop_on_unpaid_help')}
        >
          <Toggle
            checked={Boolean(companyChanges?.stop_on_unpaid_recurring)}
            onChange={(value: boolean) =>
              handleToggleChange('stop_on_unpaid_recurring', value)
            }
          />
        </Element>
      )}

      <Divider />

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="auto_archive_invoice"
            labelElement={
              <SettingsLabel
                label={t('auto_archive_invoice')}
                helpLabel={t('auto_archive_invoice_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(companyChanges?.settings?.auto_archive_invoice)}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_archive_invoice', value)
          }
          disabled={disableSettingsField('auto_archive_invoice')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="auto_archive_invoice_cancelled"
            labelElement={
              <SettingsLabel
                label={t('auto_archive_invoice_cancelled')}
                helpLabel={t('auto_archive_invoice_cancelled_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(
            companyChanges?.settings?.auto_archive_invoice_cancelled
          )}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_archive_invoice_cancelled', value)
          }
          disabled={disableSettingsField('auto_archive_invoice_cancelled')}
        />
      </Element>

      <Divider />

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="lock_invoices"
            labelElement={<SettingsLabel label={t('lock_invoices')} />}
            defaultValue="off"
          />
        }
      >
        <SelectField
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            handleToggleChange('settings.lock_invoices', event.target.value)
          }
          value={companyChanges?.settings?.lock_invoices || 'off'}
          disabled={disableSettingsField('lock_invoices')}
          errorMessage={errors?.errors['settings.lock_invoices']}
        >
          <option value="off">{t('off')}</option>
          <option value="when_sent">{t('when_sent')}</option>
          <option value="when_paid">{t('when_paid')}</option>
        </SelectField>
      </Element>
    </Card>
  );
}
