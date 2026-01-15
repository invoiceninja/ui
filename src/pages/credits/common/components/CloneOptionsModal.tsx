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
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { CloneOption } from '$app/components/CloneOption';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { Modal } from '$app/components/Modal';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { quoteAtom } from '$app/pages/quotes/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import dayjs from 'dayjs';
import { Invoice as InvoiceIcon } from '$app/components/icons/Invoice';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { creditAtom } from '../atoms';
import { Wallet } from '$app/components/icons/Wallet';
import { useColorScheme } from '$app/common/colors';
import { Files } from '$app/components/icons/Files';
import { Refresh } from '$app/components/icons/Refresh';
import { FileClock } from '$app/components/icons/FileClock';

interface Props {
  credit: Credit;
  dropdown?: boolean;
}

export function CloneOptionsModal({ credit, dropdown }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCompanyChanges();

  const navigate = useNavigate();
  const hasPermission = useHasPermission();

  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setInvoice = useSetAtom(invoiceAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);
  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const cloneToCredit = () => {
    setCredit({
      ...credit,
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
      po_number: '',
    });

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/credits/create?action=clone');
    }, 150);
  };

  const cloneToInvoice = () => {
    setInvoice({
      ...credit,
      id: '',
      number: '',
      documents: [],
      due_date: '',
      partial_due_date: '',
      date: dayjs().format('YYYY-MM-DD'),
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
      po_number: '',
      design_id: company.settings.invoice_design_id,
    });

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/invoices/create?action=clone');
    }, 150);
  };

  const cloneToQuote = () => {
    setQuote({
      ...(credit as Quote),
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
      po_number: '',
      design_id: company.settings.quote_design_id,
    });

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/quotes/create?action=clone');
    }, 150);
  };

  const cloneToRecurringInvoice = () => {
    setRecurringInvoice({
      ...(credit as unknown as RecurringInvoice),
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
      vendor_id: '',
      po_number: '',
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
      ...(credit as unknown as PurchaseOrder),
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
      po_number: '',
      due_date: '',
      partial_due_date: '',
      design_id: company.settings.purchase_order_design_id,
    });

    setIsModalVisible(false);

    setTimeout(() => {
      navigate('/purchase_orders/create?action=clone');
    }, 150);
  };

  return (
    <>
      {(hasPermission('create_credit') ||
        hasPermission('create_invoice') ||
        hasPermission('create_quote') ||
        hasPermission('create_recurring_invoice') ||
        hasPermission('create_purchase_order')) && (
        <EntityActionElement
          entity="credit"
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
            {hasPermission('create_credit') && (
              <CloneOption
                label={t('credit')}
                iconElement={<Wallet size="1.1rem" color={colors.$3} />}
                onClick={cloneToCredit}
              />
            )}

            {hasPermission('create_invoice') && (
              <CloneOption
                label={t('invoice')}
                iconElement={<InvoiceIcon size="1.1rem" color={colors.$3} />}
                onClick={cloneToInvoice}
              />
            )}

            {hasPermission('create_quote') && (
              <CloneOption
                label={t('quote')}
                iconElement={<Files size="1.1rem" color={colors.$3} />}
                onClick={cloneToQuote}
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
