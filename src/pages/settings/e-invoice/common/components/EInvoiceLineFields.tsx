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
import { useColorScheme } from '$app/common/colors';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { Card, Element } from '$app/components/cards';
import {
  E_INVOICE_LINE_OPTIONS,
  EInvoiceLineOption,
  getCustomLinePaths,
  getExposedLinePaths,
  isEInvoiceLineFieldsSupported,
  isLineOptionEnabled,
  toggleExposedLinePaths,
  withExposedLinePaths,
} from '$app/components/e-invoice/line-fields/fields';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Trash } from '$app/components/icons/Trash';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';

export function EInvoiceLineFields() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useInjectCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const paths = getExposedLinePaths(company?.e_invoice);
  const customPaths = getCustomLinePaths(paths);

  const handlePathsChange = (nextPaths: string[]) => {
    handleChange(
      'e_invoice',
      withExposedLinePaths(company?.e_invoice, nextPaths)
    );
  };

  const handleOptionToggle = (option: EInvoiceLineOption, value: boolean) => {
    const optionPaths = option.fields.map((field) => field.path);

    handlePathsChange(
      toggleExposedLinePaths(paths, optionPaths, value ? optionPaths : [])
    );
  };

  const isAvailable =
    (company?.settings.enable_e_invoice === true ||
      company?.settings.e_invoice_type === 'PEPPOL') &&
    isEInvoiceLineFieldsSupported(company?.settings.e_invoice_type);

  if (!isAvailable) {
    return null;
  }

  return (
    <Card
      title={t('e_invoice_line_fields')}
      description={t('e_invoice_line_fields_help')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      {E_INVOICE_LINE_OPTIONS.map((option) => (
        <Element
          key={option.key}
          leftSide={`${t(option.label)} (${option.businessTerm})`}
          leftSideHelp={t(option.help)}
        >
          <Toggle
            checked={isLineOptionEnabled(paths, option)}
            onValueChange={(value) => handleOptionToggle(option, value)}
            cypressRef={`e_invoice_line_field_${option.key}`}
          />
        </Element>
      ))}

      {customPaths.length > 0 && (
        <Element leftSide={t('other')}>
          <div className="flex flex-col space-y-2">
            {customPaths.map((path) => (
              <div
                key={path}
                className="flex items-center justify-between space-x-4"
              >
                <span className="font-mono text-xs break-all">{path}</span>

                <Button
                  behavior="button"
                  type="secondary"
                  onClick={() =>
                    handlePathsChange(
                      paths.filter((currentPath) => currentPath !== path)
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <div>
                      <Trash size="1rem" color="#ef4444" />
                    </div>

                    <span className="text-sm text-red-500">{t('remove')}</span>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </Element>
      )}
    </Card>
  );
}
