/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
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
