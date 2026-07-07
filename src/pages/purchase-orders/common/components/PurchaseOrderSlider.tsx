/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Slider } from '$app/components/cards/Slider';
import { TabGroup } from '$app/components/TabGroup';
import { Element } from '$app/components/cards';
import { date, endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Upload } from '$app/pages/settings/company/documents/components';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useColorScheme } from '$app/common/colors';
import { ResourceActions } from '$app/components/ResourceActions';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { PurchaseOrderStatus } from './PurchaseOrderStatus';
import { useActions } from '../hooks';

export const purchaseOrderSliderAtom = atom<PurchaseOrder | null>(null);
export const purchaseOrderSliderVisibilityAtom = atom(false);

export function PurchaseOrderSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const actions = useActions();
  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [purchaseOrder, setPurchaseOrder] = useAtom(purchaseOrderSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(
    purchaseOrderSliderVisibilityAtom
  );

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setPurchaseOrder(null);
      }}
      title={`${t('purchase_order')} ${purchaseOrder?.number}`}
      topRight={
        purchaseOrder &&
        (hasPermission('edit_purchase_order') ||
          entityAssigned(purchaseOrder)) ? (
          <ResourceActions
            label={t('actions')}
            resource={purchaseOrder}
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
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 1) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={purchaseOrder?.documents?.length}
                textCenter
              />
            );
          }
        }}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('amount')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {purchaseOrder
                ? formatMoney(
                    purchaseOrder.amount,
                    purchaseOrder.vendor?.country_id,
                    purchaseOrder.vendor?.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('date')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {purchaseOrder ? date(purchaseOrder.date, dateFormat) : null}
            </Element>

            <Element leftSide={t('status')} pushContentToRight noExternalPadding>
              {purchaseOrder ? (
                <PurchaseOrderStatus entity={purchaseOrder} />
              ) : null}
            </Element>
          </div>
        </div>

        <div className="px-4">
          <Upload
            endpoint={endpoint('/api/v1/purchase_orders/:id/upload', {
              id: purchaseOrder?.id,
            })}
            onSuccess={() => $refetch(['purchase_orders'])}
            widgetOnly
            disableUpload={
              !hasPermission('edit_purchase_order') &&
              !entityAssigned(purchaseOrder)
            }
          />

          <DocumentsTable
            documents={purchaseOrder?.documents || []}
            onDocumentDelete={() => $refetch(['purchase_orders'])}
            disableEditableOptions={
              !entityAssigned(purchaseOrder, true) &&
              !hasPermission('edit_purchase_order')
            }
          />
        </div>
      </TabGroup>
    </Slider>
  );
}
