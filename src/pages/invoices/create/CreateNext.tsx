/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Invoice } from 'common/interfaces/invoice';
import { Invitation } from 'common/interfaces/purchase-order';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankInvoiceQuery } from 'common/queries/invoices';
import { blankInvitation } from 'common/stores/slices/invoices/constants/blank-invitation';
import { Default } from 'components/layouts/Default';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { invoiceAtom } from '../common/atoms';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';

export type ChangeHandler = <T extends keyof Invoice>(
  property: T,
  value: Invoice[typeof property]
) => void;

export function CreateNext() {
  const { documentTitle } = useTitle('new_invoice');
  const { data } = useBlankInvoiceQuery();

  const company = useCurrentCompany();
  const clientResolver = useClientResolver();

  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useAtom(invoiceAtom);
  const [errors] = useState<ValidationBag>();

  const handleChange: ChangeHandler = (property, value) => {
    console.log('[Change]: ', property, value);

    setInvoice((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...invoice!.invitations];

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

  useEffect(() => {
    if (data && typeof invoice === 'undefined') {
      const _invoice = cloneDeep(data);

      if (company && company.enabled_tax_rates > 0) {
        _invoice.tax_name1 = company.settings.tax_name1;
        _invoice.tax_rate1 = company.settings.tax_rate1;
      }

      if (company && company.enabled_tax_rates > 1) {
        _invoice.tax_name2 = company.settings.tax_name2;
        _invoice.tax_rate2 = company.settings.tax_rate2;
      }

      if (company && company.enabled_tax_rates > 2) {
        _invoice.tax_name3 = company.settings.tax_name3;
        _invoice.tax_rate3 = company.settings.tax_rate3;
      }

      setInvoice(_invoice);
    }

    return () => {
      // setInvoice(undefined);
    };
  }, [data]);

  useEffect(() => {
    invoice &&
      invoice.client_id.length > 1 &&
      clientResolver.find(invoice.client_id).then((client) => {
        const invitations: Record<string, unknown>[] = [];

        client.contacts.map((contact) => {
          if (contact.send_email) {
            const invitation = cloneDeep(blankInvitation);

            invitation.client_contact_id = contact.id;
            invitations.push(invitation);
          }
        });

        handleChange('invitations', invitations);
      });
  }, [invoice?.client_id]);

  return (
    <Default title={documentTitle}>
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={invoice}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          readonly={searchParams.get('table') === 'tasks'}
          errorMessage={errors?.errors.client_id}
        />

        <InvoiceDetails invoice={invoice} handleChange={handleChange} />
      </div>
    </Default>
  );
}
