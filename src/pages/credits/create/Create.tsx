/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankInvitation } from 'common/constants/blank-invitation';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { InvoiceItemType } from 'common/interfaces/invoice-item';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { creditAtom, invoiceSumAtom } from '../common/atoms';
import { CreditDetails } from '../common/components/CreditDetails';
import { CreditFooter } from '../common/components/CreditFooter';
import { useCreate, useCreditUtilities } from '../common/hooks';
import { useBlankCreditQuery } from '../common/queries';

export function Create() {
  const { documentTitle } = useTitle('new_credit');
  const { t } = useTranslation();

  const pages: Page[] = [
    { name: t('credits'), href: '/credits' },
    {
      name: t('new_credit'),
      href: '/credits/create',
    },
  ];

  const [credit, setCredit] = useAtom(creditAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const clientResolver = useClientResolver();
  const productColumns = useProductColumns();

  const { data } = useBlankCreditQuery({
    enabled: typeof credit === 'undefined',
  });

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  } = useCreditUtilities({
    client,
  });

  useEffect(() => {
    if (typeof data !== 'undefined' && typeof credit === 'undefined') {
      const _credit = cloneDeep(data);

      if (typeof _credit.line_items === 'string') {
        _credit.line_items = [];
      }

      setCredit(_credit);
    }

    return () => {
      setCredit(undefined);
    };
  }, [data]);

  useEffect(() => {
    credit &&
      credit.client_id.length > 1 &&
      clientResolver.find(credit.client_id).then((client) => {
        setClient(client);

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
  }, [credit?.client_id]);

  useEffect(() => {
    // The InvoiceSum takes exact same reference to the `invoice` object
    // which is the reason we don't have to set a freshly built invoice,
    // rather just modified version.

    credit && calculateInvoiceSum();
  }, [credit]);

  const save = useCreate({ setErrors });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/credits"
      onSaveClick={() => save(credit!)}
      disableSaveButton={credit?.client_id.length === 0}
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector
          resource={credit}
          onChange={(id) => handleChange('client_id', id)}
          onClearButtonClick={() => handleChange('client_id', '')}
          onContactCheckboxChange={handleInvitationChange}
          errorMessage={errors?.errors.client_id}
        />

        <CreditDetails handleChange={handleChange} />

        <div className="col-span-12">
          {credit ? (
            <ProductsTable
              type="product"
              resource={credit}
              items={credit.line_items.filter(
                (item) => item.type_id === InvoiceItemType.Product
              )}
              columns={productColumns}
              relationType="client_id"
              onLineItemChange={handleLineItemChange}
              onSort={(lineItems) => handleChange('line_items', lineItems)}
              onLineItemPropertyChange={handleLineItemPropertyChange}
              onCreateItemClick={handleCreateLineItem}
              onDeleteRowClick={handleDeleteLineItem}
            />
          ) : (
            <Spinner />
          )}
        </div>

        <CreditFooter handleChange={handleChange} />

        {credit && (
          <InvoiceTotals
            relationType="client_id"
            resource={credit}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      <div className="my-4">
        {credit && (
          <InvoicePreview
            for="create"
            resource={credit}
            entity="credit"
            relationType="client_id"
            endpoint="/api/v1/live_preview?entity=:entity"
          />
        )}
      </div>
    </Default>
  );
}
