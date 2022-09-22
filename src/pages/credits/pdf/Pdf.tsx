/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { InvoiceViewer } from 'pages/invoices/common/components/InvoiceViewer';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useGeneratePdfUrl } from 'pages/invoices/common/hooks/useGeneratePdfUrl';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { useCreditQuery } from '../common/queries';

export function Pdf() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('view_pdf');
  const { id } = useParams();

  const { data: credit, isLoading } = useCreditQuery({
    id: id!,
  });

  const url = useGeneratePdfUrl({ resourceType: 'credit' });
  const downloadPdf = useDownloadPdf({ resource: 'credit' });

  return (
    <Default
      title={documentTitle}
      onBackClick={route('/credits/:id/edit', { id })}
      navigationTopRight={
        credit && (
          <Dropdown label={t('more_actions')}>
            <DropdownElement onClick={() => downloadPdf(credit)}>
              {t('download')}
            </DropdownElement>

            <DropdownElement
              to={route('/credits/:id/email', {
                id: credit.id,
              })}
            >
              {t('email_credit')}
            </DropdownElement>
          </Dropdown>
        )
      }
    >
      {isLoading && <Spinner />}

      {credit && <InvoiceViewer link={url(credit) as string} method="GET" />}
    </Default>
  );
}
