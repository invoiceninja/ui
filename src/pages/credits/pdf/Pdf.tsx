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
import { MdCreditCard, MdDownload } from 'react-icons/md';
import { useParams } from 'react-router-dom';
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
            <DropdownElement
              onClick={() => downloadPdf(credit)}
              icon={<Icon element={MdDownload} />}
            >
              {t('download')}
            </DropdownElement>

            <DropdownElement
              to={route('/credits/:id/email', {
                id: credit.id,
              })}
              icon={<Icon element={MdCreditCard} />}
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
