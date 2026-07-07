/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { date, endpoint } from '$app/common/helpers';
import { sanitizeHTML } from '$app/common/helpers/html-string';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Product } from '$app/common/interfaces/product';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { InputLabel } from '$app/components/forms';
import { ResourceActions } from '$app/components/ResourceActions';
import { TabGroup } from '$app/components/TabGroup';
import { useTaxCategories } from '$app/components/tax-rates/TaxCategorySelector';
import { Upload } from '$app/pages/settings/company/documents/components';
import classNames from 'classnames';
import { atom, useAtom } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useActions } from '../hooks';

export const productSliderAtom = atom<Product | null>(null);
export const productSliderVisibilityAtom = atom(false);

export function ProductSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const reactSettings = useReactSettings();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const formatNumber = useFormatNumber();
  const taxCategories = useTaxCategories();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const actions = useActions({ showEditAction: true });

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({ entity: 'product' });

  const [product, setProduct] = useAtom(productSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(productSliderVisibilityAtom);

  const canEdit =
    Boolean(product) &&
    (hasPermission('edit_product') || entityAssigned(product));

  const onDocumentsSuccess = () => {
    $refetch(['products']);
  };

  const stats = product
    ? [
        {
          label: t('price'),
          value: formatMoney(product.price, undefined, undefined),
          show: true,
        },
        {
          label: t('cost'),
          value: formatMoney(product.cost, undefined, undefined),
          show: Boolean(company?.enable_product_cost),
        },
        {
          label: t('default_quantity'),
          value: formatNumber(product.quantity),
          show: Boolean(company?.enable_product_quantity),
        },
        {
          label: t('stock_quantity'),
          value: formatNumber(product.in_stock_quantity),
          show: Boolean(company?.track_inventory),
        },
      ].filter((stat) => stat.show)
    : [];

  const inventoryRows =
    product && company?.track_inventory
      ? [
          {
            label: t('stock_quantity'),
            value: formatNumber(product.in_stock_quantity),
          },
          {
            label: t('stock_notifications'),
            value: product.stock_notification ? t('yes') : t('no'),
          },
          ...(product.stock_notification_threshold
            ? [
                {
                  label: t('notification_threshold'),
                  value: formatNumber(product.stock_notification_threshold),
                },
              ]
            : []),
        ]
      : [];

  const taxRows = product
    ? [
        {
          label: t('tax_category'),
          value:
            taxCategories.find(
              (taxCategory) => taxCategory.value === product.tax_id
            )?.label ?? '',
        },
        ...[
          { name: product.tax_name1, rate: product.tax_rate1 },
          { name: product.tax_name2, rate: product.tax_rate2 },
          { name: product.tax_name3, rate: product.tax_rate3 },
        ]
          .filter(
            (tax, index) =>
              (company?.enabled_item_tax_rates ?? 0) > index && tax.name
          )
          .map((tax) => ({
            label: t('tax'),
            value: `${tax.name} ${formatNumber(tax.rate)}%`,
          })),
      ].filter((row) => row.value)
    : [];

  const customFieldRows = product
    ? (
        [
          {
            label: firstCustom,
            field: 'product1',
            value: product.custom_value1,
          },
          {
            label: secondCustom,
            field: 'product2',
            value: product.custom_value2,
          },
          {
            label: thirdCustom,
            field: 'product3',
            value: product.custom_value3,
          },
          {
            label: fourthCustom,
            field: 'product4',
            value: product.custom_value4,
          },
        ] as const
      )
        .filter((field) => field.label && field.value)
        .map((field) => ({
          label: field.label as string,
          value: formatCustomFieldValue(field.field, field.value?.toString()),
        }))
    : [];

  const metaRows = product
    ? [
        {
          label: t('created_at'),
          value: date(product.created_at, dateFormat),
        },
        {
          label: t('updated_at'),
          value: date(product.updated_at, dateFormat),
        },
      ]
    : [];

  const renderRows = (rows: { label: string; value: ReactNode }[]) => (
    <div className="px-6">
      {rows.map((row, index) => (
        <Element
          key={index}
          className={classNames({
            'border-b border-dashed': index !== rows.length - 1,
          })}
          leftSide={row.label}
          withoutWrappingLeftSide
          pushContentToRight
          noExternalPadding
          style={{ borderColor: colors.$20 }}
        >
          {row.value}
        </Element>
      ))}
    </div>
  );

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setProduct(null);
      }}
      title={product?.product_key || `${t('product')}`}
      topRight={
        canEdit ? (
          <ResourceActions
            label={t('actions')}
            resource={product}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('documents')]}
        width="full"
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 1) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={product?.documents?.length}
                textCenter
              />
            );
          }
        }}
      >
        <div className="space-y-4 pb-4">
          {Boolean(stats.length) && (
            <div className="grid grid-cols-2 gap-3 px-6 pt-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col space-y-1 rounded-md border p-4"
                  style={{ borderColor: colors.$20 }}
                >
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: colors.$17 }}
                  >
                    {stat.label}
                  </span>

                  <span
                    className="text-lg font-medium"
                    style={{ color: colors.$3 }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {Boolean(product?.notes) && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              <div className="flex flex-col px-6">
                <InputLabel className="mb-2">{t('notes')}</InputLabel>

                <article
                  className={classNames(
                    'prose prose-sm max-w-none break-words',
                    {
                      'prose-invert': reactSettings?.dark_mode,
                    }
                  )}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(product?.notes ?? ''),
                  }}
                />
              </div>
            </>
          )}

          {Boolean(inventoryRows.length) && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              {renderRows(inventoryRows)}
            </>
          )}

          {Boolean(taxRows.length) && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              {renderRows(taxRows)}
            </>
          )}

          {Boolean(customFieldRows.length) && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              {renderRows(customFieldRows)}
            </>
          )}

          {Boolean(metaRows.length) && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              {renderRows(metaRows)}
            </>
          )}
        </div>

        <div className="px-4 pt-4">
          <Upload
            endpoint={endpoint('/api/v1/products/:id/upload', {
              id: product?.id,
            })}
            onSuccess={onDocumentsSuccess}
            widgetOnly
            disableUpload={!canEdit}
          />

          <DocumentsTable
            documents={product?.documents || []}
            onDocumentDelete={onDocumentsSuccess}
            disableEditableOptions={!canEdit}
          />
        </div>
      </TabGroup>
    </Slider>
  );
}
