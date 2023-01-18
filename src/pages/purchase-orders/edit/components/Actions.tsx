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
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useAtom } from 'jotai';
import { Icon } from 'components/icons/Icon';
import { BulkAction } from 'pages/expenses/edit/hooks/useBulk';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { purchaseOrderAtom } from 'pages/purchase-orders/common/atoms';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdCloudCircle,
  MdControlPointDuplicate,
  MdDelete,
  MdDownload,
  MdMarkEmailRead,
  MdPageview,
  MdPictureAsPdf,
  MdRestore,
  MdSend,
  MdSwitchRight,
} from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'components/cards/Divider';

export type Action = (po: PurchaseOrder) => {
  label: string;
  onClick: () => unknown;
  hideIf?: boolean;
  icon?: ReactElement;
  showDivider?: boolean;
};

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const downloadPdf = useDownloadPdf({ resource: 'purchase_order' });

  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

  const cloneToPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrder({
      ...purchaseOrder,
      number: '',
      documents: [],
    });

    navigate('/purchase_orders/create');
  };

  const invalidateCache = (id: string) => {
    queryClient.invalidateQueries(
      route('/api/v1/purchase_orders/:id', {
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
          navigate(route('/purchase_orders/:id/email', { id: po.id })),
        icon: <Icon element={MdSend} />,
      }),
      (po) => ({
        label: t('view_pdf'),
        onClick: () =>
          navigate(route('/purchase_orders/:id/pdf', { id: po.id })),
        icon: <Icon element={MdPictureAsPdf} />,
      }),
      (po) => ({
        label: t('download'),
        onClick: () => downloadPdf(po),
        icon: <Icon element={MdDownload} />,
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
        icon: <Icon element={MdMarkEmailRead} />,
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
        icon: <Icon element={MdSwitchRight} />,
      }),
      (po) => ({
        label: `${t('view')} ${t('expense')}`,
        onClick: () =>
          navigate(route('/expenses/:id/edit', { id: po.expense_id })),
        hideIf: po.expense_id.length <= 0,
        icon: <Icon element={MdPageview} />,
      }),
      (po) => ({
        label: t('vendor_portal'),
        onClick: () => openClientPortal(po),
        icon: <Icon element={MdCloudCircle} />,
      }),
      (po) => ({
        label: t('clone'),
        onClick: () => cloneToPurchaseOrder(po),
        icon: <Icon element={MdControlPointDuplicate} />,
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
        icon: <Icon element={MdArchive} />,
        showDivider: true,
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
        showDivider: true,
        icon: <Icon element={MdRestore} />,
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
        icon: <Icon element={MdDelete} />,
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
            <>
              {action(props.purchaseOrder).showDivider && (
                <Divider withoutPadding />
              )}

              <DropdownElement
                key={index}
                onClick={action(props.purchaseOrder).onClick}
                icon={action(props.purchaseOrder).icon}
              >
                {action(props.purchaseOrder).label}
              </DropdownElement>
            </>
          )
      )}
    </Dropdown>
  );
}
