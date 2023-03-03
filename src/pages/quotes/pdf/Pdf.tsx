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
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { useGeneratePdfUrl } from '$app/pages/invoices/common/hooks/useGeneratePdfUrl';
import { useTranslation } from 'react-i18next';
import { MdDownload, MdSend } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { useQuoteQuery } from '../common/queries';

export function Pdf() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();
  const { data: quote, isLoading } = useQuoteQuery({
    id: id!,
  });

  const url = useGeneratePdfUrl({ resourceType: 'quote' });
  const downloadPdf = useDownloadPdf({ resource: 'quote' });

  return (
    <Default
      title={documentTitle}
      onBackClick={route('/quotes/:id/edit', { id })}
      navigationTopRight={
        quote && (
          <Dropdown label={t('more_actions')}>
            <DropdownElement
              onClick={() => downloadPdf(quote)}
              icon={<Icon element={MdDownload} />}
            >
              {t('download')}
            </DropdownElement>

            <DropdownElement
              to={route('/quotes/:id/email', { id: quote.id })}
              icon={<Icon element={MdSend} />}
            >
              {t('email_quote')}
            </DropdownElement>
          </Dropdown>
        )
      }
    >
      {isLoading && <Spinner />}

      {quote && <InvoiceViewer link={url(quote) as string} method="GET" />}
    </Default>
  );
}
