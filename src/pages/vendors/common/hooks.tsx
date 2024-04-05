/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Vendor } from '$app/common/interfaces/vendor';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { EntityStatus } from '$app/components/EntityStatus';
import { Tooltip } from '$app/components/Tooltip';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';

export const defaultColumns: string[] = [
  'number',
  'name',
  'city',
  'phone',
  'entity_state',
  'created_at',
];

export function useAllVendorColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'vendor',
    });

  const vendorColumns = [
    'number',
    'name',
    'city',
    'phone',
    'entity_state',
    'created_at',
    'address2',
    'archived_at',
    'last_login_at',
    //   'assigned_to', @Todo: Need to resolve relationship
    'contacts',
    'country_id',
    //   'created_by', @Todo: Need to resolve relationship
    'currency_id',
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'documents',
    'id_number',
    'is_deleted',
    'postal_code',
    'private_notes',
    'address1',
    'updated_at',
    'vat_number',
    'website',
  ] as const;

  return vendorColumns;
}

export function useVendorColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const reactSettings = useReactSettings();
  const resolveCountry = useResolveCountry();
  const resolveCurrency = useResolveCurrency();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const vendorColumns = useAllVendorColumns();
  type VendorColumns = (typeof vendorColumns)[number];

  const getContactsColumns = useCallback((vendor: Vendor) => {
    const names: string[] = [];

    vendor.contacts.map((contact) =>
      names.push(`${contact.first_name} ${contact.last_name}`)
    );

    return names.join('<br />');
  }, []);

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'vendor',
    });

  const columns: DataTableColumnsExtended<Vendor, VendorColumns> = [
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, vendor) => (
        <DynamicLink
          to={route('/vendors/:id', { id: vendor.id })}
          renderSpan={disableNavigation('vendor', vendor)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'name',
      id: 'name',
      label: t('name'),
      format: (value, vendor) => (
        <DynamicLink
          to={route('/vendors/:id', { id: vendor.id })}
          renderSpan={disableNavigation('vendor', vendor)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'city',
      id: 'city',
      label: t('city'),
    },
    {
      column: 'phone',
      id: 'phone',
      label: t('phone'),
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, vendor) => <EntityStatus entity={vendor} />,
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'last_login_at',
      id: 'last_login',
      label: t('last_login'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'address1',
      id: 'address1',
      label: t('address1'),
    },
    {
      column: 'address2',
      id: 'address2',
      label: t('address2'),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'contacts',
      id: 'id',
      label: t('contacts'),
      format: (value, vendor) => (
        <span
          dangerouslySetInnerHTML={{ __html: getContactsColumns(vendor) }}
        />
      ),
    },
    {
      column: 'country_id',
      id: 'country_id',
      label: t('country'),
      format: (value) => value && resolveCountry(value)?.name,
    },
    {
      column: 'currency_id',
      id: 'id',
      label: t('currency'),
      format: (value) => value && resolveCurrency(value)?.code,
    },
    {
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
      format: (value) => formatCustomFieldValue('vendor1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('vendor2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('vendor3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('vendor4', value?.toString()),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, vendor) => vendor.documents.length,
    },
    {
      column: 'id_number',
      id: 'id_number',
      label: t('id_number'),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, vendor) => (vendor.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'postal_code',
      id: 'postal_code',
      label: t('postal_code'),
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span
            dangerouslySetInnerHTML={{ __html: (value as string).slice(0, 50) }}
          />
        </Tooltip>
      ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'vat_number',
      id: 'vat_number',
      label: t('vat_number'),
    },
    {
      column: 'website',
      id: 'website',
      label: t('website'),
      format: (value) => <CopyToClipboard text={value.toString()} />,
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.vendor || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
