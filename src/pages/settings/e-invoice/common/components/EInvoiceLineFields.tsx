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
  E_INVOICE_LINE_FIELDS,
  getLineTemplate,
  getTemplateFields,
  isTemplateFieldEnabled,
  toggleTemplateField,
  withLineTemplate,
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

  const template = getLineTemplate(company?.e_invoice);

  const customFields = getTemplateFields(template).filter(
    (field) => field.isCustom
  );

  const handleToggle = (path: string, enabled: boolean) => {
    handleChange(
      'e_invoice',
      withLineTemplate(
        company?.e_invoice,
        toggleTemplateField(template, path, enabled)
      )
    );
  };

  if (
    company?.settings.enable_e_invoice !== true &&
    company?.settings.e_invoice_type !== 'PEPPOL'
  ) {
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
      {E_INVOICE_LINE_FIELDS.map((field) => (
        <Element
          key={field.key}
          leftSide={t(field.label)}
          leftSideHelp={t(field.help)}
        >
          <Toggle
            checked={isTemplateFieldEnabled(template, field)}
            onValueChange={(value) => handleToggle(field.path, value)}
            cypressRef={`e_invoice_line_field_${field.key}`}
          />
        </Element>
      ))}

      {customFields.length > 0 && (
        <Element leftSide={t('other')}>
          <div className="flex flex-col space-y-2">
            {customFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between space-x-4"
              >
                <span className="font-mono text-xs break-all">
                  {field.path}
                </span>

                <Button
                  behavior="button"
                  type="secondary"
                  onClick={() => handleToggle(field.path, false)}
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
