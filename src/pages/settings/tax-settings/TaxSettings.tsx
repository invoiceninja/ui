/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { TaxRates } from '..';
import { Card, Element } from '../../../components/cards';
import { SelectField } from '../../../components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { Selector } from './components';
import { Divider } from '$app/components/cards/Divider';
import { usePaidOrSelfHost } from '$app/common/hooks/usePaidOrSelfhost';
import { CalculateTaxes } from './components/calculate-taxes/CalculateTaxes';
import { useCalculateTaxesRegion } from '$app/common/hooks/useCalculateTaxesRegion';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { HelpWidget } from '$app/components/HelpWidget';
import { CalculateTaxesNotificationModal } from './components/calculate-taxes/components/CalculateTaxesNotificationModal';
import { useColorScheme } from '$app/common/colors';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { DefaultLineItemTaxes } from './components/DefaultLineItemTaxes';

export function TaxSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tax_settings'), href: '/settings/tax_settings' },
  ];

  useInjectCompanyChanges();
  useTitle('tax_settings');

  const colors = useColorScheme();
  const isPaidOrSelfHost = usePaidOrSelfHost();

  const calculateTaxesRegion = useCalculateTaxesRegion();

  const {
    isCompanySettingsActive,
    isGroupSettingsActive,
    isClientSettingsActive,
  } = useCurrentSettingsLevel();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const handleToggleChange = (id: string, value: boolean) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );
  };

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();
  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('tax_settings')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#tax_settings"
      disableSaveButton={isFormBusy}
    >
      {isCompanySettingsActive && (
        <>
          <Card
            title={t('tax_settings')}
            className="shadow-sm pb-6"
            childrenClassName="pt-4"
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
            withoutBodyPadding
          >
            {!companyChanges.calculate_taxes && (
              <Element leftSide={t('invoice_tax_rates')}>
                <SelectField
                  value={companyChanges?.enabled_tax_rates?.toString() || '0'}
                  onValueChange={(value) =>
                    handleChange('enabled_tax_rates', Number(value))
                  }
                  errorMessage={errors?.errors.enabled_tax_rates}
                  customSelector
                  dismissable={false}
                >
                  <option value="0">{t('disabled')}</option>
                  <option value="1">{t('one_tax_rate')}</option>
                  <option value="2">{t('two_tax_rates')}</option>
                  <option value="3">{t('three_tax_rates')}</option>
                </SelectField>
              </Element>
            )}

            <Element leftSide={t('line_item_tax_rates')}>
              <SelectField
                value={
                  companyChanges?.enabled_item_tax_rates?.toString() || '0'
                }
                onValueChange={(value) =>
                  handleChange('enabled_item_tax_rates', Number(value))
                }
                errorMessage={errors?.errors.enabled_item_tax_rates}
                customSelector
                dismissable={false}
              >
                <option value="0">{t('disabled')}</option>
                <option value="1">{t('one_tax_rate')}</option>
                <option value="2">{t('two_tax_rates')}</option>
                <option value="3">{t('three_tax_rates')}</option>
              </SelectField>
            </Element>

            <Element leftSide={t('expense_tax_rates')}>
              <SelectField
                value={
                  companyChanges?.enabled_expense_tax_rates?.toString() || '0'
                }
                onValueChange={(value) =>
                  handleChange('enabled_expense_tax_rates', Number(value))
                }
                errorMessage={errors?.errors.enabled_expense_tax_rates}
                customSelector
                dismissable={false}
              >
                <option value="0">{t('disabled')}</option>
                <option value="1">{t('one_tax_rate')}</option>
                <option value="2">{t('two_tax_rates')}</option>
                <option value="3">{t('three_tax_rates')}</option>
              </SelectField>
            </Element>

            {companyChanges.calculate_taxes ? null : (
              <Element leftSide={t('inclusive_taxes')}>
                <div className="flex items-center space-x-7">
                  <Toggle
                    onChange={(value: boolean) =>
                      handleToggleChange('settings.inclusive_taxes', value)
                    }
                    checked={Boolean(companyChanges?.settings.inclusive_taxes)}
                    cypressRef="inclusiveTaxToggle"
                  />

                  {companyChanges?.settings.inclusive_taxes ? (
                    <span>{t('inclusive')}: 100 + 10% = 90.91 + 9.09</span>
                  ) : (
                    <span>{t('exclusive')}: 100 + 10% = 100 + 10</span>
                  )}
                </div>
              </Element>
            )}

            {isPaidOrSelfHost &&
              calculateTaxesRegion(companyChanges?.settings?.country_id) && (
                <>
                  <div className="px-4 sm:px-6 pt-4 pb-2">
                    <Divider
                      className="border-dashed"
                      style={{ borderColor: colors.$20 }}
                      withoutPadding
                    />
                  </div>

                  <CalculateTaxesNotificationModal />

                  {companyChanges.calculate_taxes && <CalculateTaxes />}
                </>
              )}
          </Card>

          <Selector />

          {companyChanges.enabled_item_tax_rates > 0 &&
            !companyChanges.enabled_tax_rates && <DefaultLineItemTaxes />}
        </>
      )}

      {(isGroupSettingsActive || isClientSettingsActive) && (
        <Selector title="tax_settings" />
      )}

      <TaxRates />

      <HelpWidget
        id="calculate-taxes"
        url="https://raw.githubusercontent.com/invoiceninja/invoiceninja.github.io/refs/heads/v5-rework/source/en/taxes.md"
      />
    </Settings>
  );
}
