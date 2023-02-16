/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { QuoteStatus } from 'common/enums/quote-status';
import { date, endpoint } from 'common/helpers';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { invoiceSumAtom, quoteAtom } from './atoms';
import { useApprove } from './hooks/useApprove';
import { useBulkAction } from './hooks/useBulkAction';
import { useMarkSent } from './hooks/useMarkSent';
import { creditAtom } from 'pages/credits/common/atoms';
import { recurringInvoiceAtom } from 'pages/recurring-invoices/common/atoms';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { purchaseOrderAtom } from 'pages/purchase-orders/common/atoms';
import { route } from 'common/helpers/route';
import { useDispatch } from 'react-redux';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { updateRecord } from 'common/stores/slices/company-users';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { QuoteStatus as QuoteStatusBadge } from '../common/components/QuoteStatus';
import { Link } from '@invoiceninja/forms';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useResolveCountry } from 'common/hooks/useResolveCountry';
import { CopyToClipboard } from 'components/CopyToClipboard';
import { customField } from 'components/CustomField';
import { EntityStatus } from 'components/EntityStatus';
import { useCallback } from 'react';
import { Icon } from 'components/icons/Icon';
import {
  MdArchive,
  MdCloudCircle,
  MdControlPointDuplicate,
  MdDelete,
  MdDone,
  MdDownload,
  MdMarkEmailRead,
  MdPictureAsPdf,
  MdRestore,
  MdSend,
  MdSwitchRight,
  MdTextSnippet,
} from 'react-icons/md';
import { SelectOption } from 'components/datatables/Actions';
import { useAccentColor } from 'common/hooks/useAccentColor';

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

  const calculateInvoiceSum = (quote: Quote) => {
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

        navigate(route('/quotes/:id/edit', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
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
  const dispatch = useDispatch();
  const company = useInjectCompanyChanges();

  return (quote: Quote) => {
    toast.processing();
    setErrors(undefined);

    axios
      .all([
        request('PUT', endpoint('/api/v1/quotes/:id', { id: quote.id }), quote),
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        ),
      ])
      .then((response) => {
        toast.success('updated_quote');

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );

        queryClient.invalidateQueries(
          route('/api/v1/quotes/:id', { id: quote.id })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
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

    navigate('/quotes/create?action=clone');
  };

  const cloneToCredit = (quote: Quote) => {
    setCredit({ ...quote, number: '', documents: [] });

    navigate('/credits/create?action=clone');
  };

  const cloneToRecurringInvoice = (quote: Quote) => {
    setRecurringInvoice({
      ...(quote as unknown as RecurringInvoice),
      number: '',
      documents: [],
    });

    navigate('/recurring_invoices/create?action=clone');
  };

  const cloneToPurchaseOrder = (quote: Quote) => {
    setPurchaseOrder({
      ...(quote as unknown as PurchaseOrder),
      number: '',
      documents: [],
    });

    navigate('/purchase_orders/create?action=clone');
  };

  const cloneToInvoice = (quote: Quote) => {
    setInvoice({ ...quote, number: '', documents: [] });
    navigate('/invoices/create?action=clone');
  };

  const actions: Action<Quote>[] = [
    (quote) => (
      <DropdownElement
        to={route('/quotes/:id/pdf', { id: quote.id })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => downloadPdf(quote)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_pdf')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        to={route('/quotes/:id/email', { id: quote.id })}
        icon={<Icon element={MdSend} />}
      >
        {t('email_quote')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => quote && openClientPortal(quote)}
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (quote) =>
      quote.status_id === QuoteStatus.Draft && (
        <DropdownElement
          onClick={() => markSent(quote)}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (quote) =>
      (quote.status_id === QuoteStatus.Draft ||
        quote.status_id === QuoteStatus.Sent) && (
        <DropdownElement
          onClick={() => approve(quote)}
          icon={<Icon element={MdDone} />}
        >
          {t('approve')}
        </DropdownElement>
      ),
    (quote) =>
      quote.status_id !== QuoteStatus.Converted && (
        <DropdownElement
          onClick={() => bulk(quote.id, 'convert_to_invoice')}
          icon={<Icon element={MdSwitchRight} />}
        >
          {t('convert_to_invoice')}
        </DropdownElement>
      ),
    () => <Divider withoutPadding />,
    (quote) => (
      <DropdownElement
        onClick={() => cloneToQuote(quote)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => cloneToInvoice(quote)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_invoice')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => cloneToCredit(quote)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_credit')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => cloneToRecurringInvoice(quote)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_recurring_invoice')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => cloneToPurchaseOrder(quote)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_purchase_order')}
      </DropdownElement>
    ),
    () => location.pathname.endsWith('/edit') && <Divider withoutPadding />,
    (quote) =>
      location.pathname.endsWith('/edit') &&
      quote.archived_at === 0 && (
        <DropdownElement
          onClick={() => bulk(quote.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (quote) =>
      location.pathname.endsWith('/edit') &&
      quote.archived_at > 0 && (
        <DropdownElement
          onClick={() => bulk(quote.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (quote) =>
      location.pathname.endsWith('/edit') &&
      !quote?.is_deleted && (
        <DropdownElement
          onClick={() => bulk(quote.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

export const quoteColumns = [
  'status',
  'number',
  'client',
  'amount',
  'date',
  'valid_until',
  'archived_at',
  // 'assigned_to',  @Todo: Need to fetch the relationship
  'client_city',
  'client_country',
  'client_postal_code',
  'client_state',
  'contact_email',
  'contact_name',
  'created_at',
  // 'created_by', @Todo: Need to resolve relationship
  'custom1',
  'custom2',
  'custom3',
  'custom4',
  'discount',
  'documents',
  'entity_state',
  'exchange_rate',
  'is_deleted',
  'is_viewed',
  'last_sent_date',
  'partial',
  'partial_due_date',
  'po_number',
  'private_notes',
  // 'project', @Todo: Need to resolve relationship
  'public_notes',
  'tax_amount',
  'updated_at',
  // 'vendor', @Todo: Need to resolve relationship
] as const;

type QuoteColumns = typeof quoteColumns[number];

export const defaultColumns: QuoteColumns[] = [
  'status',
  'number',
  'client',
  'amount',
  'date',
  'valid_until',
];

export function useQuoteColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const accentColor = useAccentColor();
  const navigate = useNavigate();

  const currentUser = useCurrentUser();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const resolveCountry = useResolveCountry();

  const quoteViewedAt = useCallback((quote: Quote) => {
    let viewed = '';

    quote.invitations.map((invitation) => {
      if (invitation.viewed_date) {
        viewed = invitation.viewed_date;
      }
    });

    return viewed;
  }, []);

  const columns: DataTableColumnsExtended<Quote, QuoteColumns> = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, quote) => (
        <div className="flex items-center space-x-2">
          <QuoteStatusBadge entity={quote} />

          {quote.status_id === QuoteStatus.Converted && (
            <MdTextSnippet
              className="cursor-pointer"
              fontSize={19}
              color={accentColor}
              onClick={() =>
                navigate(route('/invoices/:id/edit', { id: quote.invoice_id }))
              }
            />
          )}
        </div>
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (field, quote) => (
        <Link to={route('/quotes/:id/edit', { id: quote.id })}>{field}</Link>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (_, quote) => (
        <Link to={route('/clients/:id', { id: quote.client_id })}>
          {quote.client?.display_name}
        </Link>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id || company.settings.country_id,
          quote.client?.settings.currency_id || company.settings.currency_id
        ),
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'valid_until',
      id: 'due_date',
      label: t('valid_until'),
      format: (value, quote) => date(quote.due_date, dateFormat),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'client_city',
      id: 'client_id',
      label: t('client_city'),
      format: (value, quote) => quote.client?.city,
    },
    {
      column: 'client_country',
      id: 'client_id',
      label: t('client_country'),
      format: (value, quote) =>
        quote.client?.country_id &&
        resolveCountry(quote.client?.country_id)?.name,
    },
    {
      column: 'client_postal_code',
      id: 'client_id',
      label: t('client_postal_code'),
      format: (value, quote) => quote.client?.postal_code,
    },
    {
      column: 'client_state',
      id: 'client_id',
      label: t('client_state'),
      format: (value, quote) => quote.client?.state,
    },
    {
      column: 'contact_email',
      id: 'client_id',
      label: t('contact_email'),
      format: (value, quote) =>
        quote.client &&
        quote.client.contacts.length > 0 && (
          <CopyToClipboard text={quote.client?.contacts[0].email} />
        ),
    },
    {
      column: 'contact_name',
      id: 'client_id',
      label: t('contact_name'),
      format: (value, quote) =>
        quote.client &&
        quote.client.contacts.length > 0 &&
        `${quote.client?.contacts[0].first_name} ${quote.client?.contacts[0].last_name}`,
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'custom1',
      id: 'custom_value1',
      label:
        (company?.custom_fields.quote1 &&
          customField(company?.custom_fields.quote1).label()) ||
        t('first_custom'),
    },
    {
      column: 'custom2',
      id: 'custom_value2',
      label:
        (company?.custom_fields.quote2 &&
          customField(company?.custom_fields.quote2).label()) ||
        t('second_custom'),
    },
    {
      column: 'custom3',
      id: 'custom_value3',
      label:
        (company?.custom_fields.quote3 &&
          customField(company?.custom_fields.quote3).label()) ||
        t('third_custom'),
    },
    {
      column: 'custom4',
      id: 'custom_value4',
      label:
        (company?.custom_fields.quote4 &&
          customField(company?.custom_fields.quote4).label()) ||
        t('forth_custom'),
    },
    {
      column: 'discount',
      id: 'discount',
      label: t('discount'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id || company?.settings.country_id,
          quote.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, quote) => quote.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, quote) => <EntityStatus entity={quote} />,
    },
    {
      column: 'exchange_rate',
      id: 'exchange_rate',
      label: t('exchange_rate'),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, quote) => (quote.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'is_viewed',
      id: 'id',
      label: t('is_viewed'),
      format: (value, quote) =>
        quoteViewedAt(quote).length > 0
          ? date(quoteViewedAt(quote), dateFormat)
          : t('no'),
    },
    {
      column: 'last_sent_date',
      id: 'last_sent_date',
      label: t('last_sent_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'partial',
      id: 'partial',
      label: t('partial'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id || company?.settings.country_id,
          quote.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      column: 'partial_due_date',
      id: 'partial_due_date',
      label: t('partial_due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'po_number',
      id: 'po_number',
      label: t('po_number'),
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      column: 'tax_amount',
      id: 'total_taxes',
      label: t('total_taxes'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id || company?.settings.country_id,
          quote.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('last_updated'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    currentUser?.company_user?.settings?.react_table_columns?.quote ||
    defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useQuoteFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('draft'),
      value: 'draft',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('sent'),
      value: 'sent',
      color: 'white',
      backgroundColor: '#93C5FD',
    },
    {
      label: t('approved'),
      value: 'approved',
      color: 'white',
      backgroundColor: '#1D4ED8',
    },
    {
      label: t('expired'),
      value: 'expired',
      color: 'white',
      backgroundColor: '#e6b05c',
    },
  ];

  return filters;
}
