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
import { blankLineItem } from 'common/constants/blank-line-item';
import { CreditStatus } from 'common/enums/credit-status';
import { endpoint } from 'common/helpers';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { Client } from 'common/interfaces/client';
import { Credit } from 'common/interfaces/credit';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { InvoiceItem, InvoiceItemType } from 'common/interfaces/invoice-item';
import { Invitation } from 'common/interfaces/purchase-order';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Action } from 'components/ResourceActions';
import { useAtom } from 'jotai';
import { invoiceAtom } from 'pages/invoices/common/atoms';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { quoteAtom } from 'pages/quotes/common/atoms';
import { recurringInvoiceAtom } from 'pages/recurring-invoices/common/atoms';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import { creditAtom, invoiceSumAtom } from './atoms';
import { useBulkAction } from './hooks/useBulkAction';
import { useMarkSent } from './hooks/useMarkSent';

interface CreditUtilitiesProps {
  client?: Client;
}

export type ChangeHandler = <T extends keyof Credit>(
  property: T,
  value: Credit[typeof property]
) => void;

export function useCreditUtilities(props: CreditUtilitiesProps) {
  const currencyResolver = useResolveCurrency();
  const company = useCurrentCompany();

  const [credit, setCredit] = useAtom(creditAtom);
  const [, setInvoiceSum] = useAtom(invoiceSumAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setCredit((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...credit!.invitations];

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
    const lineItems = credit?.line_items || [];

    lineItems[index] = lineItem;

    setCredit((current) => current && { ...current, line_items: lineItems });
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const lineItems = credit?.line_items || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setCredit((current) => current && { ...current, line_items: lineItems });
  };

  const handleCreateLineItem = () => {
    setCredit(
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
    const lineItems = credit?.line_items || [];

    lineItems.splice(index, 1);

    setCredit((current) => current && { ...current, line_items: lineItems });
  };

  const calculateInvoiceSum = () => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id
    );

    if (currency && credit) {
      const invoiceSum = new InvoiceSum(credit, currency).build();

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

  return (credit: Credit) => {
    toast.processing();
    setErrors(undefined);

    request('POST', endpoint('/api/v1/credits'), credit)
      .then((response: GenericSingleResourceResponse<Credit>) => {
        toast.success('created_credit');

        navigate(
          generatePath('/credits/:id/edit', { id: response.data.data.id })
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

  return (credit: Credit) => {
    toast.processing();
    setErrors(undefined);

    request('PUT', endpoint('/api/v1/credits/:id', { id: credit.id }), credit)
      .then(() => {
        toast.success('updated_credit');

        queryClient.invalidateQueries(
          generatePath('/api/v1/credits/:id', { id: credit.id })
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
  const [, setCredit] = useAtom(creditAtom);
  const [, setInvoice] = useAtom(invoiceAtom);
  const [, setQuote] = useAtom(quoteAtom);
  const [, setRecurringInvoice] = useAtom(recurringInvoiceAtom);

  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const downloadPdf = useDownloadPdf({ resource: 'credit' });
  const markSent = useMarkSent();
  const bulk = useBulkAction();

  const cloneToCredit = (credit: Credit) => {
    setCredit({ ...credit, number: '', documents: [] });
    
    navigate('/credits/create');
  };

  const cloneToInvoice = (credit: Credit) => {
    setInvoice({ ...credit, number: '', documents: [] });

    navigate('/invoices/create');
  };

  const cloneToQuote = (credit: Credit) => {
    setQuote({ ...(credit as Quote), number: '', documents: [] });

    navigate('/quotes/create');
  };

  const cloneToRecurringInvoice = (credit: Credit) => {
    setRecurringInvoice({
      ...(credit as unknown as RecurringInvoice),
      number: '',
      documents: [],
    });

    navigate('/recurring_invoices/create')
  };

  const actions: Action<Credit>[] = [
    (credit) => (
      <DropdownElement to={generatePath('/credits/:id/pdf', { id: credit.id })}>
        {t('view_pdf')}
      </DropdownElement>
    ),
    (credit) => (
      <DropdownElement onClick={() => downloadPdf(credit)}>
        {t('download_pdf')}
      </DropdownElement>
    ),
    (credit) => (
      <DropdownElement
        to={generatePath('/credits/:id/email', { id: credit.id })}
      >
        {t('email_credit')}
      </DropdownElement>
    ),
    (credit) => (
      <DropdownElement onClick={() => credit && openClientPortal(credit)}>
        {t('client_portal')}
      </DropdownElement>
    ),
    (credit) =>
      credit.client_id &&
      credit.amount > 0 && (
        <DropdownElement
          to={generatePath(
            '/payments/create?client=:clientId&credit=:creditId&type=1',
            { clientId: credit.client_id, creditId: credit.id }
          )}
        >
          {t('apply_credit')}
        </DropdownElement>
      ),
    (credit) =>
      credit.status_id === CreditStatus.Draft && (
        <div>
          <DropdownElement onClick={() => markSent(credit)}>
            {t('mark_sent')}
          </DropdownElement>
        </div>
      ),
    () => <Divider withoutPadding />,
    (credit) => (
      <DropdownElement onClick={() => cloneToCredit(credit)}>
        {t('clone_to_credit')}
      </DropdownElement>
    ),
    (credit) => (
      <DropdownElement onClick={() => cloneToInvoice(credit)}>
        {t('clone_to_invoice')}
      </DropdownElement>
    ),
    (credit) => (
      <DropdownElement onClick={() => cloneToQuote(credit)}>
        {t('clone_to_quote')}
      </DropdownElement>
    ),
    (credit) => (
      <DropdownElement onClick={() => cloneToRecurringInvoice(credit)}>
        {t('clone_to_recurring_invoice')}
      </DropdownElement>
    ),
    () => location.pathname.endsWith('/edit') && <Divider withoutPadding />,
    (credit) =>
      location.pathname.endsWith('/edit') &&
      credit.archived_at === 0 && (
        <DropdownElement onClick={() => bulk(credit.id, 'archive')}>
          {t('archive_credit')}
        </DropdownElement>
      ),
    (credit) =>
      location.pathname.endsWith('/edit') &&
      credit.archived_at > 0 && (
        <DropdownElement onClick={() => bulk(credit.id, 'restore')}>
          {t('restore_credit')}
        </DropdownElement>
      ),
    (credit) =>
      location.pathname.endsWith('/edit') &&
      !credit?.is_deleted && (
        <DropdownElement onClick={() => bulk(credit.id, 'delete')}>
          {t('delete_credit')}
        </DropdownElement>
      ),
  ];

  return actions;
}
