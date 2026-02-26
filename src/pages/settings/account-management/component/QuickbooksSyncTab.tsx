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
import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  QuickbooksSettings,
  QuickbooksSyncDirection,
} from '$app/common/interfaces/quickbooks';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';

export function QuickBooksSyncTab() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const companyChanges = useCompanyChanges();

  const quickbooksSettings: QuickbooksSettings | undefined =
    companyChanges?.quickbooks?.settings;

  const syncDirectionOptions = [
    { value: QuickbooksSyncDirection.None, label: t('none') },
    { value: QuickbooksSyncDirection.Push, label: t('push') },
    { value: QuickbooksSyncDirection.Pull, label: t('pull') },
    { value: QuickbooksSyncDirection.Bidirectional, label: t('bidirectional') },
  ];

  const handleSyncDirectionChange = (
    entity: string,
    direction: QuickbooksSyncDirection
  ) => {
    handleChange(`quickbooks.settings.${entity}.direction`, direction);
  };

  if (!quickbooksSettings) {
    return null;
  }

  return (
    <>
      <div className="space-y-3 mb-4">
        <p className="text-sm" style={{ color: colors.$3 }}>
          These settings control the direction of data sync between QuickBooks
          and Invoice Ninja.
        </p>

        <ul
          className="list-disc list-inside space-y-2 text-sm"
          style={{ color: colors.$3 }}
        >
          <li>
            <strong>None:</strong> No data will be synced.
          </li>
          <li>
            <strong>Push:</strong> Only data from Invoice Ninja will be synced
            to QuickBooks.
          </li>
          <li>
            <strong>Pull:</strong> Only data from QuickBooks will be synced to
            Invoice Ninja.
          </li>
          <li>
            <strong>Bidirectional:</strong> Data will be synced in both
            directions. <strong>Caution:</strong> This may have unintended
            consequences!!!
          </li>
        </ul>
      </div>

      <Element leftSide={t('client')} noExternalPadding>
        <SelectField
          value={
            quickbooksSettings.client?.direction ?? QuickbooksSyncDirection.None
          }
          onValueChange={(value) =>
            handleSyncDirectionChange(
              'client',
              value as QuickbooksSyncDirection
            )
          }
          customSelector
          dismissable={false}
        >
          {syncDirectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('invoice')} noExternalPadding>
        <SelectField
          value={
            quickbooksSettings.invoice?.direction ??
            QuickbooksSyncDirection.None
          }
          onValueChange={(value) =>
            handleSyncDirectionChange(
              'invoice',
              value as QuickbooksSyncDirection
            )
          }
          customSelector
          dismissable={false}
        >
          {syncDirectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('products')} noExternalPadding>
        <SelectField
          value={
            quickbooksSettings.product?.direction ??
            QuickbooksSyncDirection.None
          }
          onValueChange={(value) =>
            handleSyncDirectionChange(
              'product',
              value as QuickbooksSyncDirection
            )
          }
          customSelector
          dismissable={false}
        >
          {syncDirectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      <div className="border-t pt-4 mt-4" style={{ borderColor: colors.$20 }}>
        <h3 className="text-sm font-medium mb-4" style={{ color: colors.$3 }}>
          QuickBooks Read Only Data
        </h3>

        {quickbooksSettings.income_account_map &&
          quickbooksSettings.income_account_map.length > 0 && (
            <Element leftSide="Income Accounts" noExternalPadding>
              <div
                className="grid grid-cols-2 gap-2 text-sm"
                style={{ color: colors.$3 }}
              >
                {quickbooksSettings.income_account_map.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2 rounded truncate"
                    style={{ backgroundColor: colors.$4 }}
                    title={entry.name}
                  >
                    {entry.name}
                  </div>
                ))}
              </div>
            </Element>
          )}

        {quickbooksSettings.tax_rate_map &&
          quickbooksSettings.tax_rate_map.length > 0 && (
            <Element leftSide={t('taxes')} noExternalPadding>
              <div className="space-y-2">
                {quickbooksSettings.tax_rate_map.map((entry, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 rounded"
                    style={{
                      backgroundColor: colors.$4,
                      color: colors.$3,
                    }}
                  >
                    <div>
                      {entry[1]} <strong>{entry[2]}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Element>
          )}
      </div>
    </>
  );
}
