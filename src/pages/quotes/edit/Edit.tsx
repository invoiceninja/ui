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
import { useParams, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { invoiceSumAtom, quoteAtom } from '../common/atoms';
import { QuoteDetails } from '../common/components/QuoteDetails';
import { QuoteFooter } from '../common/components/QuoteFooter';
import { useActions, useQuoteUtilities, useSave } from '../common/hooks';
import { useQuoteQuery } from '../common/queries';
import { Card } from '$app/components/cards';
import { QuoteStatus as QuoteStatusBadge } from '../common/components/QuoteStatus';
import { TabGroup } from '$app/components/TabGroup';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useColorScheme } from '$app/common/colors';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Quote as IQuote } from '$app/common/interfaces/quote';

export default function Edit() {
  const { documentTitle } = useTitle('edit_quote');
  const { t } = useTranslation();
  const { id } = useParams();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const reactSettings = useReactSettings();

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('edit_quote'),
      href: route('/quotes/:id/edit', { id }),
    },
  ];

  const { data } = useQuoteQuery({ id: id! });

  const [quote, setQuote] = useAtom(quoteAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const productColumns = useProductColumns();

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  } = useQuoteUtilities({ client });

  useEffect(() => {
    if (data) {
      const _quote = cloneDeep(data);

      _quote.line_items.map((item) => (item._id = v4()));

      setQuote(_quote);

      if (_quote && _quote.client) {
        setClient(_quote.client);
      }
    }
  }, [data]);

  useEffect(() => {
    quote && calculateInvoiceSum(quote);
  }, [quote]);

  const actions = useActions();
  const save = useSave({ setErrors, isDefaultFooter, isDefaultTerms });

  const [searchParams] = useSearchParams();
  const taskColumns = useTaskColumns();
  const colors = useColorScheme();

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_quote') || entityAssigned(quote)) &&
        quote && {
          navigationTopRight: (
            <ResourceActions
              resource={quote}
              actions={actions}
              onSaveClick={() => quote && save(quote)}
              cypressRef="quoteActionDropdown"
            />
          ),
        })}
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          {quote && (
            <div className="flex space-x-20">
              <span
                className="text-sm"
                style={{
                  backgroundColor: colors.$2,
                  color: colors.$3,
                  colorScheme: colors.$0,
                }}
              >
                {t('status')}
              </span>
              <QuoteStatusBadge entity={quote} />
            </div>
          )}

          <ClientSelector
            resource={quote}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={handleInvitationChange}
            errorMessage={errors?.errors.client_id}
            textOnly
            readonly
          />
        </Card>

        <QuoteDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
          >
            <div>
              {quote && client ? (
                <ProductsTable
                  type="product"
                  resource={quote}
                  items={quote.line_items.filter(
                    (item) => item.type_id === InvoiceItemType.Product
                  )}
                  columns={productColumns}
                  relationType="client_id"
                  onLineItemChange={handleLineItemChange}
                  onSort={(lineItems) => handleChange('line_items', lineItems)}
                  onLineItemPropertyChange={handleLineItemPropertyChange}
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Product)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>

            <div>
              {quote && client ? (
                <ProductsTable
                  type="task"
                  resource={quote}
                  items={quote.line_items.filter(
                    (item) => item.type_id === InvoiceItemType.Task
                  )}
                  columns={taskColumns}
                  relationType="client_id"
                  onLineItemChange={handleLineItemChange}
                  onSort={(lineItems) => handleChange('line_items', lineItems)}
                  onLineItemPropertyChange={handleLineItemPropertyChange}
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Task)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>
          </TabGroup>
        </div>

        <QuoteFooter
          handleChange={handleChange}
          errors={errors}
          isDefaultFooter={isDefaultFooter}
          isDefaultTerms={isDefaultTerms}
          setIsDefaultFooter={setIsDefaultFooter}
          setIsDefaultTerms={setIsDefaultTerms}
        />

        {quote && (
          <InvoiceTotals
            relationType="client_id"
            resource={quote}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {quote && (
            <InvoicePreview
              for="invoice"
              resource={quote}
              entity="quote"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              withRemoveLogoCTA
            />
          )}
        </div>
      )}

      <ChangeTemplateModal<IQuote>
        entity="quote"
        entities={changeTemplateResources as IQuote[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(quote) => `${t('number')}: ${quote.number}`}
        bulkUrl="/api/v1/quotes/bulk"
      />
    </Default>
  );
}
