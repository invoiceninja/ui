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
import { useCreditQuery } from 'common/queries/credits';
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
  const { data: credit, isLoading } = useCreditQuery({
    id,
  });

  const url = useGeneratePdfUrl({ resource: 'credit' });
  const downloadPdf = useDownloadPdf({ resource: 'credit' });

  return (
    <Default
      title={documentTitle}
      navigationTopRight={
        credit && (
          <>
          <Button to={generatePath('/credits/:id/edit', { id: id })} type="primary">
            {t('back')}
          </Button>
          <Dropdown label={t('more_actions')}>
            <DropdownElement onClick={() => downloadPdf(credit.data.data)}>
              {t('download')}
            </DropdownElement>

            <DropdownElement
              to={generatePath('/credits/:id/email', {
                id: credit.data.data.id,
              })}
            >
              {t('email_credit')}
            </DropdownElement>
          </Dropdown>
          </>
        )
      }
    >
      {isLoading && <Spinner />}

      {credit && (
        <InvoiceViewer link={url(credit.data.data) as string} method="GET" />
      )}
    </Default>
  );
}
