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
import { Button } from '$app/components/forms';
import { SelectField } from '$app/components/forms/SelectField';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  Quickbooks,
  QuickbooksSettings,
} from '$app/common/interfaces/quickbooks';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface QuickBooksConnectTabProps {
  quickbooks: Quickbooks;
  quickbooksSettings: QuickbooksSettings | undefined;
  onDisconnectClick: () => void;
  onIncomeAccountIdChange: (value: string) => void;
  isFormBusy: boolean;
  errors: ValidationBag | undefined;
}

export function QuickBooksConnectTab({
  quickbooks,
  quickbooksSettings,
  onDisconnectClick,
  onIncomeAccountIdChange,
  isFormBusy,
  errors,
}: QuickBooksConnectTabProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <>
      <Element leftSide={t('status')} noExternalPadding>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{t('connected')}</span>

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
          <span className="text-sm">{quickbooks.companyName}</span>
        </Element>
      )}

      {quickbooks.realmID && (
        <Element leftSide={t('realm_id')} noExternalPadding>
          <span className="text-sm">{quickbooks.realmID}</span>
        </Element>
      )}

      {quickbooksSettings && (
        <Element leftSide={t('default_income_account')} noExternalPadding>
          <SelectField
            value={quickbooksSettings.default_income_account || ''}
            onValueChange={onIncomeAccountIdChange}
            errorMessage={
              errors?.errors?.['quickbooks.settings.default_income_account']
            }
            customSelector
            withBlank
          >
            {quickbooksSettings.income_account_map &&
              quickbooksSettings.income_account_map.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
          </SelectField>
        </Element>
      )}
    </>
  );
}
