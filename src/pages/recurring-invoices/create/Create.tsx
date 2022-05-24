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
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankRecurringInvoiceQuery } from 'common/queries/recurring-invoices';
import { blankInvitation } from 'common/stores/slices/invoices/constants/blank-invitation';
import {
  dismissCurrentRecurringInvoice,
  setCurrentRecurringInvoicePropertySync,
} from 'common/stores/slices/recurring-invoices';
import { setCurrentRecurringInvoice } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ValidationAlert } from 'components/ValidationAlert';
import { cloneDeep } from 'lodash';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { ProductsTable } from '../common/components/ProductsTable';
import { useCurrentRecurringInvoice } from '../common/hooks/useCurrentRecurringInvoice';
import { useSetCurrentRecurringInvoiceProperty } from '../common/hooks/useSetCurrentRecurringInvoiceProperty';
import { useHandleCreate } from '../create/hooks/useHandleCreate';

export function Create() {
  const { documentTitle } = useTitle('new_recurring_invoice');
  const { data: recurringInvoice } = useBlankRecurringInvoiceQuery();

  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();

  const handleChange = useSetCurrentRecurringInvoiceProperty();
  const handleCreate = useHandleCreate(setErrors);

  const currentRecurringInvoice = useCurrentRecurringInvoice();
  const company = useCurrentCompany();
  const clientResolver = useClientResolver();

  const pages: BreadcrumRecord[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('new_recurring_invoice'),
      href: generatePath('/recurring_invoices/create'),
    },
  ];

  useEffect(() => {
    if (recurringInvoice?.data.data) {
      dispatch(setCurrentRecurringInvoice(recurringInvoice.data.data));

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
      dispatch(dismissCurrentRecurringInvoice());
    };
  }, [recurringInvoice]);

  useEffect(() => {
    if (currentRecurringInvoice?.client_id) {
      clientResolver
        .find(currentRecurringInvoice.client_id)
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
            setCurrentRecurringInvoicePropertySync({
              property: 'invitations',
              value: invitations,
            })
          );
        })
        .catch((error) => console.error(error));
    }
  }, [currentRecurringInvoice?.client_id]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/recurring_invoices')}
      onSaveClick={() =>
        handleCreate(currentRecurringInvoice as RecurringInvoice)
      }
      disableSaveButton={currentRecurringInvoice?.client_id.length === 0}
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        <ClientSelector />
        <InvoiceDetails autoBill={company?.settings?.auto_bill} />

        <div className="col-span-12">
          <ProductsTable />
        </div>

        <InvoiceFooter page="create" />
        <InvoiceTotals />
      </div>

      <div className="my-4">
        {currentRecurringInvoice && (
          <InvoicePreview
            for="create"
            resource={currentRecurringInvoice}
            entity="recurring_invoice"
          />
        )}
      </div>
    </Default>
  );
}
