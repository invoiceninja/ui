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
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { CloneOption } from '$app/components/CloneOption';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { Modal } from '$app/components/Modal';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import dayjs from 'dayjs';
import { Invoice as InvoiceIcon } from '$app/components/icons/Invoice';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { quoteAtom } from '../atoms';
import { Files } from '$app/components/icons/Files';
import { useColorScheme } from '$app/common/colors';
import { Wallet } from '$app/components/icons/Wallet';
import { Refresh } from '$app/components/icons/Refresh';
import { FileClock } from '$app/components/icons/FileClock';

interface Props {
  quote: Quote;
  dropdown: boolean;
}

export function CloneOptionsModal({ quote, dropdown }: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const hasPermission = useHasPermission();

  const colors = useColorScheme();
  const company = useCompanyChanges();

  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setInvoice = useSetAtom(invoiceAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);
  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const cloneToQuote = () => {
    setQuote({
      ...quote,
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

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/quotes/create?action=clone');
    }, 150);
  };

  const cloneToCredit = () => {
    setCredit({
      ...quote,
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      due_date: '',
      partial_due_date: '',
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

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/credits/create?action=clone');
    }, 150);
  };

  const cloneToRecurringInvoice = () => {
    setRecurringInvoice({
      ...(quote as unknown as RecurringInvoice),
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
      due_date: '',
      partial_due_date: '',
      design_id: company.settings.invoice_design_id,
    });

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/recurring_invoices/create?action=clone');
    }, 150);
  };

  const cloneToPurchaseOrder = () => {
    setPurchaseOrder({
      ...(quote as unknown as PurchaseOrder),
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
      due_date: '',
      partial_due_date: '',
      design_id: company.settings.purchase_order_design_id,
    });

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/purchase_orders/create?action=clone');
    }, 150);
  };

  const cloneToInvoice = () => {
    setInvoice({
      ...quote,
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
      partial_due_date: '',
      design_id: company.settings.invoice_design_id,
    });

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/invoices/create?action=clone');
    }, 150);
  };

  return (
    <>
      {(hasPermission('create_quote') ||
        hasPermission('create_invoice') ||
        hasPermission('create_credit') ||
        hasPermission('create_recurring_invoice') ||
        hasPermission('create_purchase_order')) && (
        <EntityActionElement
          entity="quote"
          actionKey="clone_to"
          isCommonActionSection={!dropdown}
          tooltipText={t('clone_to')}
          onClick={() => setIsModalVisible(true)}
          icon={MdControlPointDuplicate}
        >
          {t('clone_to')}
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
            {hasPermission('create_quote') && (
              <CloneOption
                label={t('quote')}
                iconElement={<Files size="1.1rem" color={colors.$3} />}
                onClick={cloneToQuote}
              />
            )}

            {hasPermission('create_invoice') && (
              <CloneOption
                label={t('invoice')}
                iconElement={<InvoiceIcon size="1.1rem" color={colors.$3} />}
                onClick={cloneToInvoice}
              />
            )}

            {hasPermission('create_credit') && (
              <CloneOption
                label={t('credit')}
                iconElement={<Wallet size="1.1rem" color={colors.$3} />}
                onClick={cloneToCredit}
              />
            )}

            {hasPermission('create_recurring_invoice') && (
              <CloneOption
                label={t('recurring_invoice')}
                iconElement={<Refresh size="1.1rem" color={colors.$3} />}
                onClick={cloneToRecurringInvoice}
              />
            )}

            {hasPermission('create_purchase_order') && (
              <CloneOption
                label={t('purchase_order')}
                iconElement={<FileClock size="1.1rem" color={colors.$3} />}
                onClick={cloneToPurchaseOrder}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
