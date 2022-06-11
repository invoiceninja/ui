/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { QuoteStatus } from 'common/enums/quote-status';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useCurrentQuote } from 'pages/quotes/common/hooks/useCurrentQuote';
import { useMarkSent } from 'pages/quotes/common/hooks/useMarkSent';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Actions() {
  const [t] = useTranslation();

  const { id } = useParams();

  const quote = useCurrentQuote();

  const downloadPdf = useDownloadPdf({ resource: 'quote' });
  const markSent = useMarkSent();

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        <DropdownElement to={generatePath('/quotes/:id/pdf', { id })}>
          {t('view_pdf')}
        </DropdownElement>

        {quote && (
          <DropdownElement onClick={() => downloadPdf(quote)}>
            {t('download_pdf')}
          </DropdownElement>
        )}

        <DropdownElement to={generatePath('/quotes/:id/email', { id })}>
          {t('email_quote')}
        </DropdownElement>

        <DropdownElement onClick={() => quote && openClientPortal(quote)}>
          {t('client_portal')}
        </DropdownElement>
      </div>

      <div>
        <DropdownElement to={generatePath('/quotes/:id/clone', { id })}>
          {t('clone_to_quote')}
        </DropdownElement>

        <DropdownElement to={generatePath('/quotes/:id/clone/invoice', { id })}>
          {t('clone_to_invoice')}
        </DropdownElement>
      </div>

      {quote && quote?.status_id === QuoteStatus.Draft && (
        <div>
          <DropdownElement onClick={() => markSent(quote)}>
            {t('mark_sent')}
          </DropdownElement>
        </div>
      )}
    </Dropdown>
  );
}
