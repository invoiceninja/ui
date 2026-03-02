/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Button, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  Quickbooks,
  QuickbooksSettings,
} from '$app/common/interfaces/quickbooks';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';

interface QuickBooksDetailsProps {
  quickbooks: Quickbooks;
  quickbooksSettings: QuickbooksSettings | undefined;
  onDisconnectClick: () => void;
  isFormBusy: boolean;
  errors: ValidationBag | undefined;
}

export function QuickBooksDetails({
  quickbooks,
  quickbooksSettings,
  onDisconnectClick,
  isFormBusy,
  errors,
}: QuickBooksDetailsProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const companyChanges = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <>
      <Element leftSide={t('status')} noExternalPadding>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium" style={{ color: colors.$3 }}>
            {t('connected')}
          </span>

          <Button
            type="primary"
            behavior="button"
            onClick={onDisconnectClick}
            disabled={isFormBusy}
            className="bg-red-500 border-red-500 text-white ml-auto"
          >
            {t('disconnect')}
          </Button>
        </div>
      </Element>

      {quickbooks.companyName && (
        <Element leftSide={t('company_name')} noExternalPadding>
          <span className="text-sm" style={{ color: colors.$3 }}>
            {quickbooks.companyName}
          </span>
        </Element>
      )}

      {quickbooks.realmID && (
        <Element leftSide={t('realm_id')} noExternalPadding>
          <span className="text-sm" style={{ color: colors.$3 }}>
            {quickbooks.realmID}
          </span>
        </Element>
      )}

      {quickbooksSettings && (
        <>
          <Element leftSide={t('default_income_account')} noExternalPadding>
            <SelectField
              value={
                companyChanges?.quickbooks?.settings?.qb_income_account_id || ''
              }
              onValueChange={(value) =>
                handleChange(
                  'quickbooks.settings.qb_income_account_id',
                  value || null
                )
              }
              errorMessage={
                errors?.errors?.['quickbooks.settings.qb_income_account_id']
              }
              customSelector
              withBlank
            >
              {quickbooksSettings.income_account_map?.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </SelectField>
          </Element>

          <Element
            leftSide={t('automatic_taxes')}
            leftSideHelp={t('automatic_taxes_help')}
            noExternalPadding
          >
            <span className="text-sm" style={{ color: colors.$3 }}>
              {quickbooksSettings.automatic_taxes ? t('yes') : t('no')}
            </span>
          </Element>
        </>
      )}
    </>
  );
}
