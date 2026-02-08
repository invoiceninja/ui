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

interface QuickbooksConnectTabProps {
  quickbooks: Quickbooks;
  quickbooksSettings: QuickbooksSettings | undefined;
  onDisconnectClick: () => void;
  onIncomeAccountIdChange: (value: string) => void;
  isFormBusy: boolean;
  errors: ValidationBag | undefined;
}

export function QuickbooksConnectTab({
  quickbooks,
  quickbooksSettings,
  onDisconnectClick,
  onIncomeAccountIdChange,
  isFormBusy,
  errors,
}: QuickbooksConnectTabProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div className="space-y-4 px-4 sm:px-6 py-4">
      <Element leftSide={t('status')}>
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
        <Element leftSide={t('company_name')}>
          <span className="text-sm" style={{ color: colors.$3 }}>
            {quickbooks.companyName}
          </span>
        </Element>
      )}

      {quickbooksSettings && (
        <>
          <Element leftSide="Default Income Account">
            <SelectField
              value={quickbooksSettings.default_income_account || ''}
              onValueChange={onIncomeAccountIdChange}
              errorMessage={
                errors?.errors?.['quickbooks.settings.default_income_account']
              }
              customSelector
              withBlank
            >
              {/* Options populated from settings if income_account_map exists */}
            </SelectField>
          </Element>
        </>
      )}
    </div>
  );
}
