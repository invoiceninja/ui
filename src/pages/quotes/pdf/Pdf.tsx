/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { useQuoteQuery } from 'common/queries/quotes';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { InvoiceViewer } from 'pages/invoices/common/components/InvoiceViewer';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useGeneratePdfUrl } from 'pages/invoices/common/hooks/useGeneratePdfUrl';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Pdf() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();
  const { data: quote, isLoading } = useQuoteQuery({
    id,
  });

  const url = useGeneratePdfUrl({ resource: 'quote' });
  const downloadPdf = useDownloadPdf({ resource: 'quote' });

  return (
    <Default
      title={documentTitle}
      onBackClick={generatePath('/quotes/:id/edit', { id })}
      navigationTopRight={
        quote && (
          <Dropdown label={t('more_actions')}>
            <DropdownElement onClick={() => downloadPdf(quote.data.data)}>
              {t('download')}
            </DropdownElement>

            <DropdownElement
              to={generatePath('/quotes/:id/email', { id: quote.data.data.id })}
            >
              {t('email_quote')}
            </DropdownElement>
          </Dropdown>
        )
      }
    >
      {isLoading && <Spinner />}

      {quote && (
        <InvoiceViewer link={url(quote.data.data) as string} method="GET" />
      )}
    </Default>
  );
}
