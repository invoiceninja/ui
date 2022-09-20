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
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useAtom } from 'jotai';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate } from 'react-router-dom';
import { creditAtom, invoiceSumAtom } from './atoms';

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
