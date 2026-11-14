/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { extractTextFromHTML } from '$app/common/helpers/html-string';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { InputField, Link } from '$app/components/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { EInvoiceType } from '$app/pages/settings';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import {
  EInvoiceLineField,
  EInvoiceLinesRoot,
  getLineEntries,
  getLineTemplate,
  getLineValue,
  getTemplateFields,
  setLineValue,
  withLineEntries,
} from './fields';

export interface EInvoiceLinesResource {
  id?: string;
  line_items: InvoiceItem[];
  e_invoice?: unknown;
}

interface Props {
  resource: EInvoiceLinesResource;
  root: EInvoiceLinesRoot;
  fields: EInvoiceLineField[];
  client?: Client;
  onChange: (eInvoice: EInvoiceType) => unknown;
  className?: string;
}

export function EInvoiceLines(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const themeColors = useThemeColorScheme();

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const { isAdmin, isOwner } = useAdmin();

  const { resource, root, fields, client, onChange, className } = props;

  const isHidden = Boolean(className?.split(' ').includes('hidden'));

  const [isOpened, setIsOpened] = useState<boolean>(!isHidden);

  useEffect(() => {
    if (!isHidden) {
      setIsOpened(true);
    }
  }, [isHidden]);

  const lineItems = Array.isArray(resource.line_items)
    ? resource.line_items
    : [];

  const entries = getLineEntries(resource.e_invoice, root);

  const templateKeys = getTemplateFields(
    getLineTemplate(company?.e_invoice)
  ).map((field) => field.key);

  const handleValueChange = (
    index: number,
    field: EInvoiceLineField,
    value: string
  ) => {
    if (getLineValue(entries, index, field) === value) {
      return;
    }

    onChange(
      withLineEntries(
        resource.e_invoice,
        root,
        setLineValue(entries, index, field, value)
      ) as unknown as EInvoiceType
    );
  };

  const occurrences = new Map<string, number>();

  const getRowKey = (lineItem: InvoiceItem, index: number) => {
    const id = lineItem._id ?? String(index);
    const occurrence = occurrences.get(id) ?? 0;

    occurrences.set(id, occurrence + 1);

    return `${id}:${occurrence}`;
  };

  if (!isOpened) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <div className="flex flex-col space-y-3">
        {(isAdmin || isOwner) && (
          <div className="flex justify-end">
            <Link to="/settings/e_invoice" className="whitespace-nowrap">
              {t('configure')}
            </Link>
          </div>
        )}

        <Table>
          <Thead backgroundColor={themeColors.$5}>
            <Th textColor={themeColors.$6}>{t('item')}</Th>

            {fields.map((field) => (
              <Th
                key={field.key}
                textColor={
                  templateKeys.includes(field.key) ? themeColors.$6 : colors.$22
                }
              >
                {field.isCustom ? field.label : t(field.label)}
              </Th>
            ))}
          </Thead>

          <Tbody>
            {lineItems.length ? (
              lineItems.map((lineItem, index) => (
                <Tr key={getRowKey(lineItem, index)}>
                  <Td style={{ maxWidth: '20rem' }}>
                    <div className="flex flex-col space-y-0.5">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: colors.$3 }}
                      >
                        {lineItem.product_key?.trim() ||
                          t(
                            lineItem.type_id === InvoiceItemType.Task
                              ? 'task'
                              : 'item'
                          )}
                      </span>

                      <span
                        className="text-xs truncate"
                        style={{ color: colors.$17 }}
                      >
                        {[
                          formatMoney(
                            lineItem.line_total ?? 0,
                            client?.country_id,
                            client?.settings?.currency_id
                          ),
                          extractTextFromHTML(
                            (lineItem.notes ?? '').replace(/>\s*</g, '> <')
                          ),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </div>
                  </Td>

                  {fields.map((field) => (
                    <Td key={field.key} style={{ minWidth: '11rem' }}>
                      <InputField
                        id={`e_invoice_line_${index}_${field.key}`}
                        value={getLineValue(entries, index, field)}
                        onValueChange={(value) =>
                          handleValueChange(index, field, value)
                        }
                        changeOverride
                      />
                    </Td>
                  ))}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={100}>{t('no_records_found')}</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
