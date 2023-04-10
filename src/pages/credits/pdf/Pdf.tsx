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
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { useGeneratePdfUrl } from '$app/pages/invoices/common/hooks/useGeneratePdfUrl';
import { useTranslation } from 'react-i18next';
import { MdDownload, MdSend } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreditQuery } from '../common/queries';

export default function Pdf() {
  const [t] = useTranslation();
  const navigate = useNavigate();

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
      navigationTopRight={
        credit && (
          <div className="flex space-x-3">
            <Button
              className="flex items-center space-x-1"
              onClick={() =>
                navigate(
                  route('/credits/:id/email', {
                    id: credit.id,
                  })
                )
              }
            >
              <Icon element={MdSend} color="white" />
              <span>{t('email_credit')}</span>
            </Button>

            <Button
              className="flex items-center space-x-1"
              onClick={() => downloadPdf(credit)}
            >
              <Icon element={MdDownload} color="white" />
              <span>{t('download')}</span>
            </Button>
          </div>
        )
      }
    >
      {isLoading && <Spinner />}

      {credit && <InvoiceViewer link={url(credit) as string} method="GET" />}
    </Default>
  );
}
