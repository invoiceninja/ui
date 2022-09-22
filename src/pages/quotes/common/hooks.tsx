/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { QuoteStatus } from 'common/enums/quote-status';
import { endpoint } from 'common/helpers';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { Client } from 'common/interfaces/client';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { InvoiceItem, InvoiceItemType } from 'common/interfaces/invoice-item';
import { Invitation, PurchaseOrder } from 'common/interfaces/purchase-order';
import { Quote } from 'common/interfaces/quote';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { blankLineItem } from 'common/constants/blank-line-item';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Action } from 'components/ResourceActions';
import { useAtom } from 'jotai';
import { invoiceAtom } from 'pages/invoices/common/atoms';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import { invoiceSumAtom, quoteAtom } from './atoms';
import { useApprove } from './hooks/useApprove';
import { useBulkAction } from './hooks/useBulkAction';
import { useMarkSent } from './hooks/useMarkSent';
import { creditAtom } from 'pages/credits/common/atoms';
import { recurringInvoiceAtom } from 'pages/recurring-invoices/common/atoms';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { purchaseOrderAtom } from 'pages/purchase-orders/common/atoms';
import { route } from 'common/helpers/route';

export type ChangeHandler = <T extends keyof Quote>(
  property: T,
  value: Quote[typeof property]
) => void;

interface QuoteUtilitiesProps {
  client?: Client;
}

export function useQuoteUtilities(props: QuoteUtilitiesProps) {
  const currencyResolver = useResolveCurrency();
  const company = useCurrentCompany();

  const [quote, setQuote] = useAtom(quoteAtom);
  const [, setInvoiceSum] = useAtom(invoiceSumAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setQuote((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...quote!.invitations];

    const potential =
      invitations?.find((invitation) => invitation.client_contact_id === id) ||
      -1;

    if (potential !== -1 && checked === false) {
      invitations = invitations.filter((i) => i.client_contact_id !== id);
    }

    if (potential === -1) {
      const invitation: Partial<Invitation> = {
        client_contact_id: id,
      };

      invitations.push(invitation as Invitation);
    }

    handleChange('invitations', invitations);
  };

  const handleLineItemChange = (index: number, lineItem: InvoiceItem) => {
    const lineItems = quote?.line_items || [];

    lineItems[index] = lineItem;

    setQuote((current) => current && { ...current, line_items: lineItems });
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const lineItems = quote?.line_items || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setQuote((current) => current && { ...current, line_items: lineItems });
  };

  const handleCreateLineItem = () => {
    setQuote(
      (current) =>
        current && {
          ...current,
          line_items: [
            ...current.line_items,
            { ...blankLineItem(), type_id: InvoiceItemType.Product },
          ],
        }
    );
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = quote?.line_items || [];

    lineItems.splice(index, 1);

    setQuote((quote) => quote && { ...quote, line_items: lineItems });
  };

  const calculateInvoiceSum = () => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id
    );

    if (currency && quote) {
      const invoiceSum = new InvoiceSum(quote, currency).build();

      setInvoiceSum(invoiceSum);
    }
  };

  return {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  };
}

interface CreateProps {
  setErrors: (validationBag?: ValidationBag) => unknown;
}

export function useCreate(props: CreateProps) {
  const { setErrors } = props;

  const navigate = useNavigate();

  return (quote: Quote) => {
    toast.processing();
    setErrors(undefined);

    request('POST', endpoint('/api/v1/quotes'), quote)
      .then((response: GenericSingleResourceResponse<Quote>) => {
        toast.success('created_quote');

        navigate(
          route('/quotes/:id/edit', { id: response.data.data.id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      });
  };
}

export function useSave(props: CreateProps) {
  const { setErrors } = props;

  const queryClient = useQueryClient();

  return (quote: Quote) => {
    toast.processing();
    setErrors(undefined);

    request('PUT', endpoint('/api/v1/quotes/:id', { id: quote.id }), quote)
      .then(() => {
        toast.success('updated_quote');

        queryClient.invalidateQueries(
          route('/api/v1/quotes/:id', { id: quote.id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      });
  };
}

export function useActions() {
  const [, setQuote] = useAtom(quoteAtom);
  const [, setInvoice] = useAtom(invoiceAtom);
  const [, setCredit] = useAtom(creditAtom);
  const [, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const downloadPdf = useDownloadPdf({ resource: 'quote' });
  const markSent = useMarkSent();
  const approve = useApprove();
  const bulk = useBulkAction();

  const cloneToQuote = (quote: Quote) => {
    setQuote({ ...quote, number: '', documents: [] });

    navigate('/quotes/create');
  };

  const cloneToCredit = (quote: Quote) => {
    setCredit({ ...quote, number: '', documents: [] });

    navigate('/credits/create');
  };

  const cloneToRecurringInvoice = (quote: Quote) => {
    setRecurringInvoice({
      ...(quote as unknown as RecurringInvoice),
      number: '',
      documents: [],
    });

    navigate('/recurring_invoices/create');
  };

  const cloneToPurchaseOrder = (quote: Quote) => {
    setPurchaseOrder({
      ...(quote as unknown as PurchaseOrder),
      number: '',
      documents: [],
    });

    navigate('/purchase_orders/create');
  };

  const cloneToInvoice = (quote: Quote) => {
    setInvoice({ ...quote, number: '', documents: [] });
    navigate('/invoices/create');
  };

  const actions: Action<Quote>[] = [
    (quote) => (
      <DropdownElement to={route('/quotes/:id/pdf', { id: quote.id })}>
        {t('view_pdf')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement onClick={() => downloadPdf(quote)}>
        {t('download_pdf')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement to={route('/quotes/:id/email', { id: quote.id })}>
        {t('email_quote')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement onClick={() => quote && openClientPortal(quote)}>
        {t('client_portal')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (quote) => (
      <DropdownElement onClick={() => cloneToQuote(quote)}>
        {t('clone_to_quote')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement onClick={() => cloneToInvoice(quote)}>
        {t('clone_to_invoice')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement onClick={() => cloneToCredit(quote)}>
        {t('clone_to_credit')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement onClick={() => cloneToRecurringInvoice(quote)}>
        {t('clone_to_recurring_invoice')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement onClick={() => cloneToPurchaseOrder(quote)}>
        {t('clone_to_purchase_order')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (quote) =>
      quote.status_id === QuoteStatus.Draft && (
        <DropdownElement onClick={() => markSent(quote)}>
          {t('mark_sent')}
        </DropdownElement>
      ),
    (quote) =>
      quote.status_id === QuoteStatus.Draft && (
        <DropdownElement onClick={() => approve(quote)}>
          {t('approve')}
        </DropdownElement>
      ),
    (quote) =>
      quote.status_id === QuoteStatus.Sent && (
        <DropdownElement onClick={() => approve(quote)}>
          {t('approve')}
        </DropdownElement>
      ),
    () => location.pathname.endsWith('/edit') && <Divider withoutPadding />,
    (quote) =>
      location.pathname.endsWith('/edit') &&
      quote.archived_at === 0 && (
        <DropdownElement onClick={() => bulk(quote.id, 'archive')}>
          {t('archive_quote')}
        </DropdownElement>
      ),
    (quote) =>
      location.pathname.endsWith('/edit') &&
      quote.archived_at > 0 && (
        <DropdownElement onClick={() => bulk(quote.id, 'restore')}>
          {t('restore_quote')}
        </DropdownElement>
      ),
    (quote) =>
      location.pathname.endsWith('/edit') &&
      !quote?.is_deleted && (
        <DropdownElement onClick={() => bulk(quote.id, 'delete')}>
          {t('delete_quote')}
        </DropdownElement>
      ),
  ];

  return actions;
}
