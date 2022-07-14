/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { useBlankInvoiceQuery } from 'common/queries/invoices';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useSearchParams } from 'react-router-dom';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { ProductsTable } from '../common/components/ProductsTable';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import { InvoicePreview } from '../common/components/InvoicePreview';
import { useHandleCreate } from './hooks/useHandleCreate';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ValidationAlert } from 'components/ValidationAlert';
import { useSetCurrentInvoiceProperty } from '../common/hooks/useSetCurrentInvoiceProperty';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { cloneDeep } from 'lodash';
import { blankInvitation } from 'common/stores/slices/invoices/constants/blank-invitation';
import {
  dismissCurrentInvoice,
  injectBlankItemIntoCurrent,
  setCurrentInvoicePropertySync,
  toggleCurrentInvoiceInvitation,
} from 'common/stores/slices/invoices';
import { setCurrentInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice-line-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/invoices/extra-reducers/set-current-line-item-property';
import { deleteInvoiceLineItem } from 'common/stores/slices/invoices/extra-reducers/delete-invoice-item';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';

export function Create() {
  const { documentTitle } = useTitle('new_invoice');
  const { data: invoice } = useBlankInvoiceQuery();

  const [t] = useTranslation();
  const [hasClientSet, setHasClientSet] = useState(false);
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();

  const handleCreate = useHandleCreate(setErrors);
  const handleChange = useSetCurrentInvoiceProperty();

  const currentInvoice = useCurrentInvoice();
  const company = useCurrentCompany();
  const clientResolver = useClientResolver();
  const invoiceSum = useInvoiceSum();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('new_invoice'),
      href: generatePath('/invoices/create'),
    },
  ];

  useEffect(() => {
    const preload = searchParams.has('preload')
      ? searchParams.get('preload') === 'true'
      : false;

    if (invoice?.data.data && !preload) {
      dispatch(setCurrentInvoice(invoice.data.data));

      if (company && company.enabled_tax_rates > 0) {
        handleChange('tax_name1', company.settings?.tax_name1);
        handleChange('tax_rate1', company.settings?.tax_rate1);
      }

      if (company && company.enabled_tax_rates > 1) {
        handleChange('tax_name2', company.settings?.tax_name2);
        handleChange('tax_rate2', company.settings?.tax_rate2);
      }

      if (company && company.enabled_tax_rates > 2) {
        handleChange('tax_name3', company.settings?.tax_name3);
        handleChange('tax_rate3', company.settings?.tax_rate3);
      }
    }

    return () => {
      dispatch(dismissCurrentInvoice());
    };
  }, [invoice]);

  useEffect(() => {
    if (currentInvoice?.client_id) {
      clientResolver
        .find(currentInvoice.client_id)
        .then((client) => {
          const invitations: Record<string, unknown>[] = [];

          client.contacts.map((contact) => {
            if (contact.send_email) {
              const invitation = cloneDeep(blankInvitation);

              invitation.client_contact_id = contact.id;
              invitations.push(invitation);
            }
          });

          dispatch(
            setCurrentInvoicePropertySync({
              property: 'invitations',
              value: invitations,
            })
          );
        })
        .catch((error) => console.error(error));
    }
  }, [currentInvoice?.client_id]);

  useEffect(() => {
    if (searchParams.has('client') && !hasClientSet && currentInvoice) {
      handleChange('client_id', searchParams.get('client'));
      setHasClientSet(true);
    }
  }, [currentInvoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/invoices')}
      onSaveClick={() => handleCreate(currentInvoice as Invoice)}
      disableSaveButton={currentInvoice?.client_id.length === 0}
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        {currentInvoice && (
          <ClientSelector
            resource={currentInvoice}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={(contactId, value) =>
              dispatch(
                toggleCurrentInvoiceInvitation({ contactId, checked: value })
              )
            }
          />
        )}

        <InvoiceDetails />

        <div className="col-span-12">
          {currentInvoice && (
            <ProductsTable
              resource={currentInvoice}
              onProductChange={(index, lineItem) =>
                dispatch(setCurrentInvoiceLineItem({ index, lineItem }))
              }
              onLineItemPropertyChange={(key, value, index) =>
                dispatch(
                  setCurrentLineItemProperty({
                    position: index,
                    property: key,
                    value,
                  })
                )
              }
              onSort={(lineItems) => handleChange('line_items', lineItems)}
              onDeleteRowClick={(index) =>
                dispatch(deleteInvoiceLineItem(index))
              }
              onCreateItemClick={() => dispatch(injectBlankItemIntoCurrent())}
            />
          )}
        </div>

        <InvoiceFooter page="create" />

        {currentInvoice && (
          <InvoiceTotals
            resource={currentInvoice}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property as keyof Invoice, value)
            }
          />
        )}
      </div>

      <div className="my-4">
        {currentInvoice && (
          <InvoicePreview
            for="create"
            resource={currentInvoice}
            entity="invoice"
          />
        )}
      </div>
    </Default>
  );
}
