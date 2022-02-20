import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';



export function Payments() {
    const [t] = useTranslation();

    const pages: BreadcrumRecord[] = [{ name: t('payments'), href: '/payments' }];
    const columns: DataTableColumns = [
        {
          id: 'status',
          label: t('status'),
          format: (value, resource) => (
            <span className="inline-flex items-center space-x-4">
              <EntityStatus entity={resource} />
    
              <Link to={generatePath('/payments/:id/edit', { id: resource.id })}>
                {value}
              </Link>
            </span>
          ),
        },
        {
          id: 'number',
          label: t('number'),
        },
        {
          id: 'client',
          label: t('client'),
        },
        {
          id: 'amount',
          label: t('amount'),
        },
        {
          id: 'invoice_number',
          label: t('invoice_number'),
        },
        {
            id: 'date',
            label: t('date'),
          },
          {
            id: 'type',
            label: t('type'),
          },
          {
            id: 'transaction_reference',
            label: t('transaction_reference'),
          },
      ];
  return (
   <Default
   breadcrumbs={pages}
   docsLink='docs/payments/'
   >
<DataTable
        resource="payment"
        columns={columns}
        endpoint="/api/v1/payments"
        linkToCreate="/payments/create"
        linkToEdit="/payments/:id/edit"
        withResourcefulActions
      />



   </Default>
  )
}

