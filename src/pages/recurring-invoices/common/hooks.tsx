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
import { RecurringInvoiceStatus } from 'common/enums/recurring-invoice-status';
import { RecurringInvoiceStatus as RecurringInvoiceStatusBadge } from '../common/components/RecurringInvoiceStatus';
import { date, endpoint } from 'common/helpers';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { Client } from 'common/interfaces/client';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItem, InvoiceItemType } from 'common/interfaces/invoice-item';
import { Invitation, PurchaseOrder } from 'common/interfaces/purchase-order';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { blankLineItem } from 'common/constants/blank-line-item';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Action } from 'components/ResourceActions';
import { useAtom } from 'jotai';
import { invoiceAtom } from 'pages/invoices/common/atoms';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { invoiceSumAtom, recurringInvoiceAtom } from './atoms';
import { quoteAtom } from 'pages/quotes/common/atoms';
import { Quote } from 'common/interfaces/quote';
import { creditAtom } from 'pages/credits/common/atoms';
import { Credit } from 'common/interfaces/credit';
import { purchaseOrderAtom } from 'pages/purchase-orders/common/atoms';
import { route } from 'common/helpers/route';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { Link } from '@invoiceninja/forms';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { StatusBadge } from 'components/StatusBadge';
import recurringInvoicesFrequency from 'common/constants/recurring-invoices-frequency';
import { customField } from 'components/CustomField';
import { EntityStatus } from 'components/EntityStatus';

interface RecurringInvoiceUtilitiesProps {
  client?: Client;
}

export type ChangeHandler = <T extends keyof RecurringInvoice>(
  property: T,
  value: RecurringInvoice[typeof property]
) => void;

export function useRecurringInvoiceUtilities(
  props: RecurringInvoiceUtilitiesProps
) {
  const currencyResolver = useResolveCurrency();
  const company = useCurrentCompany();

  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [, setInvoiceSum] = useAtom(invoiceSumAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setRecurringInvoice(
      (current) => current && { ...current, [property]: value }
    );
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...recurringInvoice!.invitations];

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
    const lineItems = recurringInvoice?.line_items || [];

    lineItems[index] = lineItem;

    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && { ...recurringInvoice, line_items: lineItems }
    );
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const lineItems = recurringInvoice?.line_items || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && { ...recurringInvoice, line_items: lineItems }
    );
  };

  const handleCreateLineItem = () => {
    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && {
          ...recurringInvoice,
          line_items: [
            ...recurringInvoice.line_items,
            { ...blankLineItem(), type_id: InvoiceItemType.Product },
          ],
        }
    );
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = recurringInvoice?.line_items || [];

    lineItems.splice(index, 1);

    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && { ...recurringInvoice, line_items: lineItems }
    );
  };

  const calculateInvoiceSum = () => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id
    );

    if (currency && recurringInvoice) {
      const invoiceSum = new InvoiceSum(recurringInvoice, currency).build();

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

interface RecurringInvoiceSaveProps {
  setErrors: (errors: ValidationBag | undefined) => unknown;
}

export function useSave(props: RecurringInvoiceSaveProps) {
  const { setErrors } = props;
  const queryClient = useQueryClient();

  return (recurringInvoice: RecurringInvoice) => {
    toast.processing();
    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/recurring_invoices/:id', { id: recurringInvoice.id }),
      recurringInvoice
    )
      .then(() => {
        queryClient.invalidateQueries(
          route('/api/v1/recurring_invoices/:id', {
            id: recurringInvoice.id,
          })
        );

        toast.success('updated_recurring_invoice');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        console.error(error);

        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      });
  };
}

export function useToggleStartStop() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return (recurringInvoice: RecurringInvoice, action: 'start' | 'stop') => {
    toast.processing();

    const url =
      action === 'start'
        ? '/api/v1/recurring_invoices/:id?start=true'
        : '/api/v1/recurring_invoices/:id?stop=true';

    request('PUT', endpoint(url, { id: recurringInvoice.id }), recurringInvoice)
      .then(() => {
        queryClient.invalidateQueries('/api/v1/recurring_invoices');

        queryClient.invalidateQueries(
          route('/api/v1/recurring_invoices/:id', {
            id: recurringInvoice.id,
          })
        );

        toast.success(
          action === 'start'
            ? t('started_recurring_invoice')
            : t('stopped_recurring_invoice')
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
  };
}

export function useActions() {
  const [, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [, setInvoice] = useAtom(invoiceAtom);
  const [, setQuote] = useAtom(quoteAtom);
  const [, setCredit] = useAtom(creditAtom);
  const [, setPurchaseOrder] = useAtom(purchaseOrderAtom);

  const { t } = useTranslation();

  const navigate = useNavigate();
  const toggleStartStop = useToggleStartStop();

  const cloneToRecurringInvoice = (recurringInvoice: RecurringInvoice) => {
    setRecurringInvoice({ ...recurringInvoice, documents: [], number: '' });

    navigate('/recurring_invoices/create');
  };

  const cloneToInvoice = (recurringInvoice: RecurringInvoice) => {
    setInvoice({
      ...(recurringInvoice as unknown as Invoice),
      documents: [],
      number: '',
    });

    navigate('/invoices/create');
  };

  const cloneToQuote = (recurringInvoice: RecurringInvoice) => {
    setQuote({
      ...(recurringInvoice as unknown as Quote),
      number: '',
      documents: [],
    });

    navigate('/quotes/create');
  };

  const cloneToCredit = (recurringInvoice: RecurringInvoice) => {
    setCredit({
      ...(recurringInvoice as unknown as Credit),
      number: '',
      documents: [],
    });

    navigate('/credits/create');
  };

  const cloneToPurchaseOrder = (recurringInvoice: RecurringInvoice) => {
    setPurchaseOrder({
      ...(recurringInvoice as unknown as PurchaseOrder),
      number: '',
      documents: [],
    });

    navigate('/purchase_orders/create');
  };

  const actions: Action<RecurringInvoice>[] = [
    (recurringInvoice) => (
      <DropdownElement
        to={route('/recurring_invoices/:id/pdf', {
          id: recurringInvoice.id,
        })}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (recurringInvoice) =>
      (recurringInvoice.status_id === RecurringInvoiceStatus.DRAFT ||
        recurringInvoice.status_id === RecurringInvoiceStatus.PAUSED) && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringInvoice, 'start')}
        >
          {t('start')}
        </DropdownElement>
      ),
    (recurringInvoice) =>
      recurringInvoice.status_id === RecurringInvoiceStatus.ACTIVE && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringInvoice, 'stop')}
        >
          {t('stop')}
        </DropdownElement>
      ),
    () => <Divider withoutPadding />,
    (recurringInvoice) => (
      <DropdownElement
        onClick={() => cloneToRecurringInvoice(recurringInvoice)}
      >
        {t('clone_to_recurring')}
      </DropdownElement>
    ),
    (recurringInvoice) => (
      <DropdownElement onClick={() => cloneToInvoice(recurringInvoice)}>
        {t('clone_to_invoice')}
      </DropdownElement>
    ),
    (recurringInvoice) => (
      <DropdownElement onClick={() => cloneToQuote(recurringInvoice)}>
        {t('clone_to_quote')}
      </DropdownElement>
    ),
    (recurringInvoice) => (
      <DropdownElement onClick={() => cloneToCredit(recurringInvoice)}>
        {t('clone_to_credit')}
      </DropdownElement>
    ),
    (recurringInvoice) => (
      <DropdownElement onClick={() => cloneToPurchaseOrder(recurringInvoice)}>
        {t('clone_to_purchase_order')}
      </DropdownElement>
    ),
  ];

  return actions;
}

export function useCreate({ setErrors }: RecurringInvoiceSaveProps) {
  const navigate = useNavigate();

  return (recurringInvoice: RecurringInvoice) => {
    setErrors(undefined);
    toast.processing();

    request('POST', endpoint('/api/v1/recurring_invoices'), recurringInvoice)
      .then((response: GenericSingleResourceResponse<RecurringInvoice>) => {
        toast.success('created_recurring_invoice');

        navigate(
          route('/recurring_invoices/:id/edit', {
            id: response.data.data.id,
          })
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

export const recurringInvoiceColumns = [
  'status',
  'number',
  'client',
  'amount',
  'remaining_cycles',
  'next_send_date',
  'frequency',
  'due_date_days',
  'auto_bill',
  'archived_at',
  // 'assigned_to', @Todo: Need to fetch the relationship.
  'created_at',
  // 'created_by', @Todo: Need to fetch the relationship.
  'custom1',
  'custom2',
  'custom3',
  'custom4',
  'discount',
  'documents',
  'entity_state',
  'exchange_rate',
  'is_deleted',
  'po_number',
  'private_notes',
  'public_notes',
  'updated_at',
] as const;

type RecurringInvoiceColumns = typeof recurringInvoiceColumns[number];

export const defaultColumns: RecurringInvoiceColumns[] = [
  'status',
  'number',
  'client',
  'amount',
  'remaining_cycles',
  'next_send_date',
  'frequency',
  'due_date_days',
  'auto_bill',
];

export function useRecurringInvoiceColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const company = useCurrentCompany();
  const currentUser = useCurrentUser();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumnsExtended<
    RecurringInvoice,
    RecurringInvoiceColumns
  > = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, recurringInvoice) => (
        <RecurringInvoiceStatusBadge entity={recurringInvoice} />
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, recurringInvoice) => (
        <Link
          to={route('/recurring_invoices/:id/edit', {
            id: recurringInvoice.id,
          })}
        >
          {value}
        </Link>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, recurringInvoice) => (
        <Link to={route('/clients/:id', { id: recurringInvoice.client_id })}>
          {recurringInvoice.client?.display_name}
        </Link>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, recurringInvoice) =>
        formatMoney(
          value,
          recurringInvoice.client?.country_id || company.settings.country_id,
          recurringInvoice.client?.settings.currency_id ||
            company.settings.currency_id
        ),
    },
    {
      column: 'remaining_cycles',
      id: 'remaining_cycles',
      label: t('remaining_cycles'),
      format: (value) => (Number(value) < 0 ? t('endless') : value),
    },
    {
      column: 'next_send_date',
      id: 'next_send_date',
      label: t('next_send_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'frequency',
      id: 'frequency_id',
      label: t('frequency'),
      format: (value) => (
        <StatusBadge for={recurringInvoicesFrequency} code={value} headless />
      ),
    },
    {
      column: 'due_date_days',
      id: 'due_date_days',
      label: t('due_date'),
      format: (value) => {
        if (value === 'terms') return t('use_payment_terms');
        else if (Number(value) === 1) return t('first_day_of_the_month');
        else return value;
      },
    },
    {
      column: 'auto_bill',
      id: 'auto_bill',
      label: t('auto_bill'),
      format: (value) => t(String(value)),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
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
        (company?.custom_fields.invoice1 &&
          customField(company?.custom_fields.invoice1).label()) ||
        t('first_custom'),
    },
    {
      column: 'custom2',
      id: 'custom_value2',
      label:
        (company?.custom_fields.invoice2 &&
          customField(company?.custom_fields.invoice2).label()) ||
        t('second_custom'),
    },
    {
      column: 'custom3',
      id: 'custom_value3',
      label:
        (company?.custom_fields.invoice3 &&
          customField(company?.custom_fields.invoice3).label()) ||
        t('third_custom'),
    },
    {
      column: 'custom4',
      id: 'custom_value4',
      label:
        (company?.custom_fields.invoice4 &&
          customField(company?.custom_fields.invoice4).label()) ||
        t('forth_custom'),
    },
    {
      column: 'discount',
      id: 'discount',
      label: t('discount'),
      format: (value, recurringInvoice) =>
        recurringInvoice.is_amount_discount
          ? formatMoney(
              value,
              recurringInvoice.client?.country_id ||
                company?.settings.country_id,
              recurringInvoice.client?.settings.currency_id ||
                company?.settings.currency_id
            )
          : `${recurringInvoice.discount}%`,
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, recurringInvoice) => recurringInvoice.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, recurringInvoice) => (
        <EntityStatus entity={recurringInvoice} />
      ),
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
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'po_number',
      id: 'po_number',
      label: t('po_number'),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    currentUser?.company_user?.settings?.react_table_columns
      ?.recurringInvoice || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
