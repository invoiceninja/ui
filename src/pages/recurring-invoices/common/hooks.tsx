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
import { endpoint } from 'common/helpers';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { Client } from 'common/interfaces/client';
import { InvoiceItem, InvoiceItemType } from 'common/interfaces/invoice-item';
import { Invitation } from 'common/interfaces/purchase-order';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { blankLineItem } from 'common/stores/slices/invoices/constants/blank-line-item';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Action } from 'components/ResourceActions';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate } from 'react-router-dom';
import { invoiceSumAtom, recurringInvoiceAtom } from './atoms';

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
          generatePath('/api/v1/recurring_invoices/:id', {
            id: recurringInvoice.id,
          })
        );

        toast.success('updated_recurring_invoice');
      })
      .catch((error: AxiosError) => {
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
        queryClient.invalidateQueries(
          generatePath('/api/v1/recurring_invoices/:id', {
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

  const { t } = useTranslation();

  const navigate = useNavigate();
  const toggleStartStop = useToggleStartStop();

  const cloneToRecurringInvoice = (recurringInvoice: RecurringInvoice) => {
    setRecurringInvoice({ ...recurringInvoice, documents: [], number: '' });

    navigate('/recurring_invoices/create');
  };

  const actions: Action<RecurringInvoice>[] = [
    (recurringInvoice) => (
      <DropdownElement
        to={generatePath('/recurring_invoices/:id/pdf', {
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
    (recurringInvoice) => (
      <DropdownElement
        onClick={() => cloneToRecurringInvoice(recurringInvoice)}
      >
        {t('clone_to_recurring')}
      </DropdownElement>
    ),
  ];

  return actions;
}
