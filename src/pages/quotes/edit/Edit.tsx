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
import { useQuoteQuery } from 'common/queries/quotes';
import { dismissCurrentQuote } from 'common/stores/slices/quotes';
import { setCurrentQuote } from 'common/stores/slices/quotes/extra-reducers/set-current-quote';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { QuoteDetails } from '../common/components/QuoteDetails';

export function Edit() {
  const { documentTitle } = useTitle('edit_quote');
  const { id } = useParams();
  const { data: quote } = useQuoteQuery({ id });

  const [t] = useTranslation();

  const dispatch = useDispatch();

  const pages: BreadcrumRecord[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('edit_quote'),
      href: generatePath('/quotes/:id/edit', { id }),
    },
  ];

  useEffect(() => {
    if (quote?.data.data) {
      dispatch(setCurrentQuote(quote.data.data));
    }

    return () => {
      dispatch(dismissCurrentQuote());
    };
  }, [quote]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/quotes')}
    >
      <div className="grid grid-cols-12 gap-4">
        <QuoteDetails />
      </div>
    </Default>
  );
}
