/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Document } from '../pages/Documents';

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
  const { dateFormat } = useCurrentCompanyDateFormats();

  const reactSettings = useReactSettings();
  const documentColumns = useAllDocumentColumns();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const navigate = useNavigate();

  type ExpenseColumns = (typeof documentColumns)[number];

  const columns: DataTableColumnsExtended<Document, ExpenseColumns> = [
    {
      column: 'name',
      id: 'name',
      label: t('name'),
      format: (value) => value,
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.expense || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
