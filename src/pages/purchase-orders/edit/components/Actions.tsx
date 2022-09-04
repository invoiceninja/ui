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
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate } from 'react-router-dom';

interface Action {
  label: string;
  onClick: () => unknown;
  hideIf?: boolean;
}

export function useActions(purchaseOrder: PurchaseOrder) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const downloadPdf = useDownloadPdf({ resource: 'purchaseOrder' });
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
      {
        label: t('send_email'),
        onClick: () =>
          navigate(
            generatePath('/purchase_orders/:id/email', { id: purchaseOrder.id })
          ),
      },
      {
        label: t('view_pdf'),
        onClick: () =>
          navigate(
            generatePath('/purchase_orders/:id/pdf', { id: purchaseOrder.id })
          ),
      },
      {
        label: t('download'),
        onClick: () => downloadPdf(purchaseOrder),
      },
      {
        label: t('mark_sent'),
        onClick: () => {
          toast.processing();

          request(
            'PUT',
            endpoint('/api/v1/purchase_orders/:id?mark_sent=true', {
              id: purchaseOrder.id,
            }),
            purchaseOrder
          )
            .then(() => toast.success('notification_purchase_order_sent'))
            .catch((error) => {
              console.error(error);

              toast.error();
            })
            .finally(() => invalidateCache(purchaseOrder.id));
        },
        hideIf: purchaseOrder.status_id === PurchaseOrderStatus.Sent,
      },
      {
        label: t('convert_to_expense'),
        onClick: () =>
          bulk([purchaseOrder.id], 'expense')
            .then(() => toast.success('converted_to_expense'))
            .catch((error) => {
              console.error(error);

              toast.error();
            })
            .finally(() => invalidateCache(purchaseOrder.id)),
        hideIf: purchaseOrder.expense_id.length > 0,
      },
      {
        label: t('view_expense_label'),
        onClick: () =>
          navigate(
            generatePath('/expenses/:id/edit', { id: purchaseOrder.expense_id })
          ),
        hideIf: purchaseOrder.expense_id.length <= 0,
      },
    ];

    return actions.filter((action) => !action.hideIf);
  };
}

interface Props {
  purchaseOrder: PurchaseOrder;
}

export function Actions(props: Props) {
  const { t } = useTranslation();

  const actions = useActions(props.purchaseOrder);

  return (
    <Dropdown label={t('more_actions')}>
      {actions().map((action, index) => (
        <DropdownElement onClick={action.onClick} key={index}>
          {action.label}
        </DropdownElement>
      ))}
    </Dropdown>
  );
}
