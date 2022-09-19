/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from "axios";
import { endpoint } from "common/helpers";
import { InvoiceSum } from "common/helpers/invoices/invoice-sum";
import { request } from "common/helpers/request";
import { toast } from "common/helpers/toast/toast";
import { useCurrentCompany } from "common/hooks/useCurrentCompany";
import { useResolveCurrency } from "common/hooks/useResolveCurrency";
import { Client } from "common/interfaces/client";
import { GenericSingleResourceResponse } from "common/interfaces/generic-api-response";
import { InvoiceItem, InvoiceItemType } from "common/interfaces/invoice-item";
import { Invitation } from "common/interfaces/purchase-order";
import { Quote } from "common/interfaces/quote";
import { ValidationBag } from "common/interfaces/validation-bag";
import { blankLineItem } from "common/stores/slices/invoices/constants/blank-line-item";
import { useAtom } from "jotai";
import { generatePath, useNavigate } from "react-router-dom";
import { invoiceSumAtom, quoteAtom } from "./atoms";

export type ChangeHandler = <T extends keyof Quote>(
  property: T,
  value: Quote[typeof property],
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
    setQuote(
      (current) => current && { ...current, [property]: value },
    );
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

    handleChange("invitations", invitations);
  };

  const handleLineItemChange = (index: number, lineItem: InvoiceItem) => {
    const lineItems = quote?.line_items || [];

    lineItems[index] = lineItem;

    setQuote(
      (current) => current && { ...current, line_items: lineItems },
    );
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number,
  ) => {
    const lineItems = quote?.line_items || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setQuote(
      (current) => current && { ...current, line_items: lineItems },
    );
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
        },
    );
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = quote?.line_items || [];

    lineItems.splice(index, 1);

    setQuote(
      (quote) => quote && { ...quote, line_items: lineItems },
    );
  };

  const calculateInvoiceSum = () => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id,
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

    request("POST", endpoint("/api/v1/quotes"), quote).then(
      (response: GenericSingleResourceResponse<Quote>) => {
        toast.success('created_quote');

        navigate(
          generatePath("/quotes/:id/edit", { id: response.data.data.id }),
        );
      },
    ).catch((error: AxiosError) => {
      console.error(error);

      error.response?.status === 422
        ? toast.dismiss() && setErrors(error.response.data)
        : toast.error();
    });
  };
}
