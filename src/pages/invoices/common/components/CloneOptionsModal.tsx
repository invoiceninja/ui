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
import { EntityActionElement } from '$app/components/EntityActionElement';
import { Modal } from '$app/components/Modal';
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

  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);
  const company = useCompanyChanges();

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
      design_id: company.settings.quote_design_id,

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
      design_id: company.settings.credit_design_id,

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
      design_id: company.settings.invoice_design_id,

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
      design_id: company.settings.purchase_order_design_id,

    });

    navigate('/purchase_orders/create?action=clone');
  };

  return (
    <>
      {(hasPermission('create_purchase_order') ||
        hasPermission('create_quote') ||
        hasPermission('create_recurring_invoice') ||
        hasPermission('create_credit')) && (
        <EntityActionElement
          entity="invoice"
          actionKey="clone_to_other"
          isCommonActionSection={!dropdown}
          tooltipText={t('clone_to_other')}
          onClick={() => setIsModalVisible(true)}
          icon={MdControlPointDuplicate}
        >
          {t('clone_to_other')}
        </EntityActionElement>
      )}

      <Modal
        title={t('clone_to')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        closeButtonCypressRef="cloneOptionsModalXButton"
      >
        <div className="flex justify-center">
          <div className="flex flex-1 flex-col items-center space-y-3">
            {hasPermission('create_recurring_invoice') && (
              <CloneOption
                label={t('recurring_invoice')}
                icon={Repeat}
                onClick={cloneToRecurringInvoice}
              />
            )}

            {hasPermission('create_quote') && (
              <CloneOption
                label={t('quote')}
                icon={File}
                onClick={cloneToQuote}
              />
            )}

            {hasPermission('create_credit') && (
              <CloneOption
                label={t('credit')}
                icon={FileText}
                onClick={cloneToCredit}
              />
            )}

            {hasPermission('create_purchase_order') && (
              <CloneOption
                label={t('purchase_order')}
                icon={BiFile}
                onClick={cloneToPurchaseOrder}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
