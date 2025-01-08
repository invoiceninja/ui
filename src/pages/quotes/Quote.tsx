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
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Quote as IQuote } from '$app/common/interfaces/quote';
import { useQuoteQuery } from './common/queries';
import { invoiceSumAtom, quoteAtom } from './common/atoms';
import { useActions, useQuoteUtilities, useSave } from './common/hooks';
import { Tabs } from '$app/components/Tabs';
import { useTabs } from './edit/hooks/useTabs';
import { useAtomWithPrevent } from '$app/common/hooks/useAtomWithPrevent';
import { useAtom } from 'jotai';
import { CommonActions } from '../invoices/edit/components/CommonActions';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';

export default function Edit() {
  const { documentTitle } = useTitle('edit_quote');
  const [t] = useTranslation();

  const { id } = useParams();

  const actions = useActions();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('edit_quote'),
      href: route('/quotes/:id/edit', { id }),
    },
  ];

  const { data, isLoading } = useQuoteQuery({ id: id! });

  const [quote, setQuote] = useAtomWithPrevent(quoteAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const tabs = useTabs({ quote });
  const save = useSave({ setErrors, isDefaultFooter, isDefaultTerms });

  const { calculateInvoiceSum } = useQuoteUtilities({ client });

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

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
      afterBreadcrumbs={<PreviousNextNavigation entity="quote" />}
    >
      {quote?.id === id || !isLoading ? (
        <div className="space-y-4">
          <Tabs
            tabs={tabs}
            rightSide={
              quote && (
                <div className="flex items-center">
                  <CommonActions resource={quote} entity="quote" />
                </div>
              )
            }
          />

          <Outlet
            context={{
              quote,
              setQuote,
              errors,
              isDefaultTerms,
              setIsDefaultTerms,
              isDefaultFooter,
              setIsDefaultFooter,
              client,
              invoiceSum,
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
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
