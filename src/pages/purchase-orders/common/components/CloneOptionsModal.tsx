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
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
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
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { quoteAtom } from '$app/pages/quotes/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import dayjs from 'dayjs';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { File, FileText, Repeat } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Props {
  purchaseOrder: PurchaseOrder;
}

export function CloneOptionsModal(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { purchaseOrder } = props;

  const hasPermission = useHasPermission();

  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setInvoice = useSetAtom(invoiceAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);
  const company = useCompanyChanges();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const cloneToInvoice = () => {
    setInvoice({
      ...(purchaseOrder as unknown as Invoice),
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
      client_id: '',
      paid_to_date: 0,
      po_number: purchaseOrder.number,
      design_id: company.settings.invoice_design_id,

    });

    navigate('/invoices/create?action=clone');
  };

  const cloneToQuote = () => {
    setQuote({
      ...(purchaseOrder as unknown as Quote),
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
      client_id: '',
      paid_to_date: 0,
      po_number: purchaseOrder.number,
      design_id: company.settings.quote_design_id,

    });

    navigate('/quotes/create?action=clone');
  };

  const cloneToRecurringInvoice = () => {
    setRecurringInvoice({
      ...(purchaseOrder as unknown as RecurringInvoice),
      id: '',
      number: '',
      documents: [],
      frequency_id: '5',
      paid_to_date: 0,
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      client_id: '',
      po_number: purchaseOrder.number,
      design_id: company.settings.invoice_design_id,

    });

    navigate('/recurring_invoices/create?action=clone');
  };

  const cloneToCredit = () => {
    setCredit({
      ...(purchaseOrder as unknown as Credit),
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
      client_id: '',
      paid_to_date: 0,
      po_number: purchaseOrder.number,
      design_id: company.settings.credit_design_id,
    });

    navigate('/credits/create?action=clone');
  };

  return (
    <>
      {(hasPermission('create_invoice') ||
        hasPermission('create_quote') ||
        hasPermission('create_recurring_invoice') ||
        hasPermission('create_credit')) && (
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
          <div className="flex flex-1 flex-col items-center space-y-3">
            {hasPermission('create_invoice') && (
              <CloneOption
                label={t('invoice')}
                icon={FileText}
                onClick={cloneToInvoice}
              />
            )}

            {hasPermission('create_quote') && (
              <CloneOption
                label={t('quote')}
                icon={File}
                onClick={cloneToQuote}
              />
            )}

            {hasPermission('create_recurring_invoice') && (
              <CloneOption
                label={t('recurring_invoice')}
                icon={Repeat}
                onClick={cloneToRecurringInvoice}
              />
            )}

            {hasPermission('create_credit') && (
              <CloneOption
                label={t('credit')}
                icon={FileText}
                onClick={cloneToCredit}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
