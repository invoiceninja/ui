/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { useTranslation } from 'react-i18next';
import { LineItemAction } from '../../common/components/LineItemActions';
import { Icon } from '$app/components/icons/Icon';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useSetAtom } from 'jotai';
import { invoiceAtom } from '../../common/atoms';
import { v4 } from 'uuid';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { quoteAtom } from '$app/pages/quotes/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import { CloneLineItemToOtherAction } from '../components/CloneLineItemToOtherAction';

interface Params {
  entity:
    | 'invoice'
    | 'recurring_invoice'
    | 'credit'
    | 'purchase_order'
    | 'quote';
}
export function useLineItemActions(params: Params) {
  const [t] = useTranslation();

  const { entity } = params;

  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setInvoice = useSetAtom(invoiceAtom);
  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);

  const handleCloneLineItem = (lineItem: InvoiceItem) => {
    if (entity === 'invoice') {
      setInvoice(
        (current) =>
          current && {
            ...current,
            line_items: [...current.line_items, { ...lineItem, _id: v4() }],
          }
      );
    } else if (entity === 'credit') {
      setCredit(
        (current) =>
          current && {
            ...current,
            line_items: [...current.line_items, { ...lineItem, _id: v4() }],
          }
      );
    } else if (entity === 'purchase_order') {
      setPurchaseOrder(
        (current) =>
          current && {
            ...current,
            line_items: [...current.line_items, { ...lineItem, _id: v4() }],
          }
      );
    } else if (entity === 'quote') {
      setQuote(
        (current) =>
          current && {
            ...current,
            line_items: [...current.line_items, { ...lineItem, _id: v4() }],
          }
      );
    } else if (entity === 'recurring_invoice') {
      setRecurringInvoice(
        (current) =>
          current && {
            ...current,
            line_items: [...current.line_items, { ...lineItem, _id: v4() }],
          }
      );
    }
  };

  const actions: LineItemAction[] = [
    (lineItem) => (
      <DropdownElement
        icon={<Icon element={MdControlPointDuplicate} />}
        onClick={() => handleCloneLineItem(lineItem)}
      >
        {t('clone')}
      </DropdownElement>
    ),
    (lineItem) => (
      <CloneLineItemToOtherAction entity={entity} lineItem={lineItem} />
    ),
  ];

  return actions;
}
