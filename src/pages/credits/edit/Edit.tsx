/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { ClientSelector } from '$app/pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { creditAtom, invoiceSumAtom } from '../common/atoms';
import { CreditDetails } from '../common/components/CreditDetails';
import { CreditFooter } from '../common/components/CreditFooter';
import { useActions, useCreditUtilities, useSave } from '../common/hooks';
import { useCreditQuery } from '../common/queries';
import { Card } from '$app/components/cards';
import { CreditStatus as CreditStatusBadge } from '../common/components/CreditStatus';

export default function Edit() {
  const { documentTitle } = useTitle('edit_credit');
  const { t } = useTranslation();
  const { id } = useParams();

  const reactSettings = useReactSettings();

  const pages: Page[] = [
    { name: t('credits'), href: '/credits' },
    {
      name: t('edit_credit'),
      href: route('/credits/:id/edit', { id }),
    },
  ];

  const { data } = useCreditQuery({ id: id! });

  const [credit, setQuote] = useAtom(creditAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const productColumns = useProductColumns();
  const clientResolver = useClientResolver();

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  } = useCreditUtilities({ client });

  useEffect(() => {
    if (data) {
      const _credit = cloneDeep(data);

      _credit.line_items.map((item) => (item._id = v4()));

      setQuote(_credit);

      if (_credit && _credit.client) {
        setClient(_credit.client);

        clientResolver.cache(_credit.client);
      }
    }
  }, [data]);

  useEffect(() => {
    credit && calculateInvoiceSum(credit);
  }, [credit]);

  const actions = useActions();
  const save = useSave({ setErrors });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => credit && save(credit)}
      navigationTopRight={
        credit && (
          <ResourceActions
            resource={credit}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          {credit && (
            <div className="flex space-x-20">
              <span className="text-sm text-gray-900">{t('status')}</span>
              <CreditStatusBadge entity={credit} />
            </div>
          )}

          <ClientSelector
            resource={credit}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={handleInvitationChange}
            errorMessage={errors?.errors.client_id}
            readonly
            textOnly
          />
        </Card>

        <CreditDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          {credit ? (
            <ProductsTable
              type="product"
              resource={credit}
              items={credit.line_items.filter((item) =>
                [
                  InvoiceItemType.Product,
                  InvoiceItemType.UnpaidFee,
                  InvoiceItemType.PaidFee,
                  InvoiceItemType.LateFee,
                ].includes(item.type_id)
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

        <CreditFooter handleChange={handleChange} errors={errors} />

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

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {credit && (
            <InvoicePreview
              for="invoice"
              resource={credit}
              entity="credit"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
            />
          )}
        </div>
      )}
    </Default>
  );
}
