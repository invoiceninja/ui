/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import { Document } from '../pages/Documents';
import { date } from '$app/common/helpers';
import { Link } from '$app/components/forms';

export const defaultColumns: string[] = [
  'name',
  'linked_to',
  'size',
  'width',
  'height',
  'private',
  'created_at',
];
export function useAllDocumentColumns() {
  const documentColumns = [
    'name',
    'linked_to',
    'size',
    'width',
    'height',
    'private',
    'created_at',
    'hash',
    'id',
    'type',
  ] as const;

  return documentColumns;
}

export function useDocumentColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();
  const documentColumns = useAllDocumentColumns();
  const { dateFormat } = useCurrentCompanyDateFormats();

  type DocumentColumns = (typeof documentColumns)[number];

  const columns: DataTableColumnsExtended<Document, DocumentColumns> = [
    {
      column: 'name',
      id: 'name',
      label: t('name'),
    },
    {
      column: 'linked_to',
      id: 'link',
      label: t('linked_to'),
      format: (value) => {
        if (value) {
          const entity = (value as string).split('/')[1];

          return <Link to={value as string}>{t(entity.slice(0, -1))}</Link>;
        }
      },
    },
    {
      column: 'size',
      id: 'size',
      label: t('size'),
      format: (value) => `${value} KB`,
    },
    {
      column: 'width',
      id: 'width',
      label: t('width'),
    },
    {
      column: 'height',
      id: 'height',
      label: t('height'),
    },
    {
      column: 'private',
      id: 'is_public',
      label: t('private'),
      format: (value) => (value ? t('no') : t('yes')),
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'hash',
      id: 'hash',
      label: t('hash'),
    },
    {
      column: 'type',
      id: 'type',
      label: t('type'),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.clientDocument || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
