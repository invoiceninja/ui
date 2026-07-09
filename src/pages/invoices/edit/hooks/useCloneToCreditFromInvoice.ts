/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { useSetAtom } from 'jotai';
import { set } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { creditAtom } from '$app/pages/credits/common/atoms';

export function useCloneToCreditFromInvoice() {
  const navigate = useNavigate();
  const company = useCurrentCompany();
  const setCredit = useSetAtom(creditAtom);

  return (invoice: Invoice) => {
    const credit = {
      ...(invoice as unknown as Credit),
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
      design_id: company?.settings.credit_design_id,
      client: undefined,
      invoice_id: invoice.id,
      e_invoice: null,
    } as unknown as Credit;

    set(
      credit,
      'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.ID',
      invoice.number
    );
    set(
      credit,
      'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.IssueDate',
      invoice.date
    );

    setCredit(credit);
    navigate('/credits/create?action=clone');
  };
}
