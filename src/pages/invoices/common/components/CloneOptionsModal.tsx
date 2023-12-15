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
import { useShowActionByPreferences } from '$app/common/hooks/useShowActionByPreferences';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { CloneOption } from '$app/components/CloneOption';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { quoteAtom } from '$app/pages/quotes/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import dayjs from 'dayjs';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { File, FileText, Repeat } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { BiFile } from 'react-icons/bi';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Props {
  invoice: Invoice;
  dropdown: boolean;
}

export function CloneOptionsModal(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { invoice, dropdown } = props;

  const hasPermission = useHasPermission();

  const showActionByPreferences = useShowActionByPreferences({
    commonActionsSection: Boolean(!dropdown),
    entity: 'invoice',
  });

  const showRIActionByPreferenceAndPermission =
    hasPermission('create_recurring_invoice') &&
    showActionByPreferences('invoice', 'clone_to_recurring');

  const showQuoteActionByPreferenceAndPermission =
    hasPermission('create_quote') &&
    showActionByPreferences('invoice', 'clone_to_quote');

  const showCreditActionByPreferenceAndPermission =
    hasPermission('create_credit') &&
    showActionByPreferences('invoice', 'clone_to_credit');

  const showPRActionByPreferenceAndPermission =
    hasPermission('create_purchase_order') &&
    showActionByPreferences('invoice', 'clone_to_purchase_order');

  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

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

  return (
    <>
      {(showRIActionByPreferenceAndPermission ||
        showQuoteActionByPreferenceAndPermission ||
        showCreditActionByPreferenceAndPermission ||
        showPRActionByPreferenceAndPermission) && (
        <DropdownElement
          onClick={() => setIsModalVisible(true)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone_to_other')}
        </DropdownElement>
      )}

      <Modal
        title={t('clone_to')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        closeButtonCypressRef="cloneOptionsModalXButton"
      >
        <div className="flex justify-center">
          <div className="flex flex-col">
            {showRIActionByPreferenceAndPermission && (
              <CloneOption
                label={t('recurring_invoice')}
                icon={Repeat}
                onClick={cloneToRecurringInvoice}
                commonActionsSection={!dropdown}
              />
            )}

            {showQuoteActionByPreferenceAndPermission && (
              <CloneOption
                label={t('quote')}
                icon={File}
                onClick={cloneToQuote}
                commonActionsSection={!dropdown}
              />
            )}

            {showCreditActionByPreferenceAndPermission && (
              <CloneOption
                label={t('credit')}
                icon={FileText}
                onClick={cloneToCredit}
                commonActionsSection={!dropdown}
              />
            )}

            {showPRActionByPreferenceAndPermission && (
              <CloneOption
                label={t('purchase_order')}
                icon={BiFile}
                onClick={cloneToPurchaseOrder}
                commonActionsSection={!dropdown}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
