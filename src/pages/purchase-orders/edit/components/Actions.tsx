/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PurchaseOrderStatus } from 'common/enums/purchase-order-status';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { BulkAction } from 'pages/expenses/edit/hooks/useBulk';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate } from 'react-router-dom';

export type Action = (po: PurchaseOrder) => {
  label: string;
  onClick: () => unknown;
  hideIf?: boolean;
};

export function useActions() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const downloadPdf = useDownloadPdf({ resource: 'purchase_order' });
  const queryClient = useQueryClient();

  const invalidateCache = (id: string) => {
    queryClient.invalidateQueries(
      generatePath('/api/v1/purchase_orders/:id', {
        id,
      })
    );
  };

  const bulk = (ids: string[], action: BulkAction | 'expense') => {
    toast.processing();

    return request('POST', endpoint('/api/v1/purchase_orders/bulk'), {
      action,
      ids,
    });
  };

  return () => {
    const actions: Action[] = [
      (po) => ({
        label: t('send_email'),
        onClick: () =>
          navigate(generatePath('/purchase_orders/:id/email', { id: po.id })),
      }),
      (po) => ({
        label: t('view_pdf'),
        onClick: () =>
          navigate(generatePath('/purchase_orders/:id/pdf', { id: po.id })),
      }),
      (po) => ({
        label: t('download'),
        onClick: () => downloadPdf(po),
      }),
      (po) => ({
        label: t('mark_sent'),
        onClick: () => {
          toast.processing();

          request(
            'PUT',
            endpoint('/api/v1/purchase_orders/:id?mark_sent=true', {
              id: po.id,
            }),
            po
          )
            .then(() => toast.success('notification_purchase_order_sent'))
            .catch((error) => {
              console.error(error);

              toast.error();
            })
            .finally(() => invalidateCache(po.id));
        },
        hideIf: po.status_id === PurchaseOrderStatus.Sent,
      }),
      (po) => ({
        label: t('convert_to_expense'),
        onClick: () =>
          bulk([po.id], 'expense')
            .then(() => toast.success('converted_to_expense'))
            .catch((error) => {
              console.error(error);

              toast.error();
            })
            .finally(() => invalidateCache(po.id)),
        hideIf: po.expense_id.length > 0,
      }),
      (po) => ({
        label: `${t('view')} ${t('expense')}`,
        onClick: () =>
          navigate(generatePath('/expenses/:id/edit', { id: po.expense_id })),
        hideIf: po.expense_id.length <= 0,
      }),
      (po) => ({
        label: t('clone_to_purchase_order'),
        onClick: () =>
          navigate(generatePath('/purchase_orders/:id/clone', { id: po.id })),
      }),
      (po) => ({
        label: t('vendor_portal'),
        onClick: () => openClientPortal(po),
      }),
      (po) => ({
        label: t('archive'),
        onClick: () =>
          bulk([po.id], 'archive')
            .then(() => toast.success('archived_purchase_order'))
            .catch((error) => {
              console.error(error);
              toast.error();
            })
            .finally(() => invalidateCache(po.id)),
        hideIf: po.archived_at > 0,
      }),
      (po) => ({
        label: t('restore'),
        onClick: () =>
          bulk([po.id], 'restore')
            .then(() => toast.success('restored_purchase_order'))
            .catch((error) => {
              console.error(error);
              toast.error();
            })
            .finally(() => invalidateCache(po.id)),
        hideIf: po.archived_at === 0,
      }),
      (po) => ({
        label: t('delete'),
        onClick: () =>
          bulk([po.id], 'delete')
            .then(() => toast.success('deleted_purchase_order'))
            .catch((error) => {
              console.error(error);
              toast.error();
            })
            .finally(() => invalidateCache(po.id)),
        hideIf: po.is_deleted,
      }),
    ];

    return actions;
  };
}

interface Props {
  purchaseOrder: PurchaseOrder;
}

export function Actions(props: Props) {
  const { t } = useTranslation();

  const actions = useActions();

  return (
    <Dropdown label={t('more_actions')}>
      {actions().map(
        (action, index) =>
          !action(props.purchaseOrder).hideIf && (
            <DropdownElement
              key={index}
              onClick={action(props.purchaseOrder).onClick}
            >
              {action(props.purchaseOrder).label}
            </DropdownElement>
          )
      )}
    </Dropdown>
  );
}
