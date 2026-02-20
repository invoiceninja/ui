/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useDocumentQuery } from '$app/common/queries/docuninja/documents';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { Actions } from './components/Actions';
import { Page } from '$app/components/Breadcrumbs';
import { route } from '$app/common/helpers/route';
import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';

export default function Pdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useDocumentQuery({ id, enabled: Boolean(id) });

  const [t] = useTranslation();
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [blobUrl, setBlobUrl] = useState('');
  const [document, setDocument] = useState<Document>();

  useEffect(() => {
    if (data) {
      setDocument(data);

      if (data.status_id !== DocumentStatus.Completed) {
        navigate(route('/docuninja/:id', { id }));
        return;
      }

      if (data.files && data.files.length > 0 && data.files[0].url) {
        setPdfUrl(data.files[0].url);
      }
    }
  }, [data, navigate, id]);

  const onLink = (url: string) => setBlobUrl(url);

  const pages: Page[] = [
    { name: t('docuninja'), href: '/docuninja' },
    {
      name: document?.description || t('document'),
      href: route('/docuninja/:id', { id }),
    },
    {
      name: t('pdf'),
      href: route('/docuninja/:id/pdf', { id }),
    },
  ];

  return (
    <Default
      breadcrumbs={pages}
      title={t('view_pdf')}
      navigationTopRight={
        document && <Actions document={document} blobUrl={blobUrl} />
      }
    >
      {pdfUrl ? (
        <InvoiceViewer onLink={onLink} link={pdfUrl} method="GET" />
      ) : (
        <div
          className="flex justify-center items-center"
          style={{ height: 1500 }}
        >
          <Spinner />
        </div>
      )}
    </Default>
  );
}
