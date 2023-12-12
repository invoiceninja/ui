/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useShowActionByPreferences } from '$app/common/hooks/useShowActionByPreferences';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import dayjs from 'dayjs';
import { useSetAtom } from 'jotai';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { invoiceAtom } from '../atoms';
import { quoteAtom } from '$app/pages/quotes/common/atoms';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { ClickableElement } from '$app/components/cards';

interface Props {
  invoice: Invoice;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  dropdown?: boolean;
}
export function CloneOptionsModal(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const setInvoice = useSetAtom(invoiceAtom);
  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);
  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);

  const { invoice, visible, setVisible, dropdown } = props;

  const showActionByPreferences = useShowActionByPreferences({
    commonActionsSection: Boolean(!dropdown),
    entity: 'invoice',
  });

  const cloneToInvoice = () => {
    setInvoice({
      ...invoice,
      id: '',
      number: '',
      documents: [],
      due_date: '',
      date: dayjs().format('YYYY-MM-DD'),
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/invoices/create?action=clone');
  };

  const cloneToQuote = () => {
    setQuote({
      ...(invoice as unknown as Quote),
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      due_date: '',
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/quotes/create?action=clone');
  };

  const cloneToCredit = () => {
    setCredit({
      ...(invoice as unknown as Credit),
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      due_date: '',
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/credits/create?action=clone');
  };

  const cloneToRecurringInvoice = () => {
    setRecurringInvoice({
      ...(invoice as unknown as RecurringInvoice),
      id: '',
      number: '',
      documents: [],
      frequency_id: '5',
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/recurring_invoices/create?action=clone');
  };

  const cloneToPurchaseOrder = () => {
    setPurchaseOrder({
      ...(invoice as unknown as PurchaseOrder),
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '1',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/purchase_orders/create?action=clone');
  };

  if (!dropdown) {
    return (
      <>
        <>
          {showActionByPreferences('invoice', 'clone') && (
            <DropdownElement
              onClick={cloneToInvoice}
              icon={<Icon element={MdControlPointDuplicate} color="white" />}
            >
              {t('clone')}
            </DropdownElement>
          )}
        </>
        <>
          {showActionByPreferences('invoice', 'clone_to_quote') && (
            <DropdownElement
              onClick={cloneToQuote}
              icon={<Icon element={MdControlPointDuplicate} color="white" />}
            >
              {t('clone_to_quote')}
            </DropdownElement>
          )}
        </>
        <>
          {showActionByPreferences('invoice', 'clone_to_credit') && (
            <DropdownElement
              onClick={cloneToCredit}
              icon={<Icon element={MdControlPointDuplicate} color="white" />}
            >
              {t('clone_to_credit')}
            </DropdownElement>
          )}
        </>
        <>
          {showActionByPreferences('invoice', 'clone_to_recurring') && (
            <DropdownElement
              onClick={cloneToRecurringInvoice}
              icon={<Icon element={MdControlPointDuplicate} color="white" />}
            >
              {t('clone_to_recurring')}
            </DropdownElement>
          )}
        </>
        <>
          {showActionByPreferences('invoice', 'clone_to_purchase_order') && (
            <DropdownElement
              onClick={cloneToPurchaseOrder}
              icon={<Icon element={MdControlPointDuplicate} color="white" />}
            >
              {t('clone_to_purchase_order')}
            </DropdownElement>
          )}
        </>
      </>
    );
  }

  return (
    <>
      <DropdownElement
        onClick={cloneToPurchaseOrder}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>

      <Modal
        title={t('clone_options')}
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <ClickableElement></ClickableElement>
      </Modal>
    </>
  );
}
