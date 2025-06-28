/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import {
  useDocumentQuery,
  useDocumentTimelineQuery,
} from '$app/common/queries/docuninja/documents';
import { Page } from '$app/components/Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Default } from '$app/components/layouts/Default';
import { Alert } from '$app/components/Alert';
import { useMemo, useState } from 'react';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { Spinner } from '$app/components/Spinner';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Button } from '$app/components/forms';
import type { DocumentFile } from '$app/common/interfaces/docuninja/api';
import { TimelineLayout } from './components/timeline-layout';
import { Invitations } from './components/invitations';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';

const STATUS_VARIANTS = {
  1: 'generic',
  2: 'dark-blue',
  3: 'yellow',
  4: 'green',
  5: 'red',
};

export default function Document() {
  const { documentTitle } = useTitle('view_document');
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const [error, setError] = useState<string | null>(null);

  const STATUS_LABELS = useMemo(
    () => ({
      1: t('draft'),
      2: t('sent'),
      3: t('viewed'),
      4: t('completed'),
      5: t('cancelled'),
    }),
    []
  );

  const { data: document, isLoading } = useDocumentQuery({
    id,
    enabled: Boolean(id),
  });

  const { data: timelineData, isLoading: isTimelineLoading } =
    useDocumentTimelineQuery({
      id,
      enabled: Boolean(id),
    });

  const pages: Page[] = [
    { name: t('documents'), href: '/documents' },
    {
      name: document?.description || documentTitle,
      href: route('/documents/:id', { id }),
    },
  ];

  const handleDownload = (file: DocumentFile) => {
    console.log('Download file:', file.id);
    // Implement download logic here
  };

  const handlePreview = (file: DocumentFile) => {
    console.log('Preview file:', file.id);
    // Implement preview logic here
  };

  return (
    <Default
      title={document?.description || documentTitle}
      breadcrumbs={pages}
      docsLink="en/documents"
      navigationTopRight={
        <Button
          type="primary"
          behavior="button"
          to={route('/documents/:id/builder', { id: document?.id })}
        >
          {t('edit')}
        </Button>
      }
    >
      {!document && !isLoading && !error && (
        <Alert type="danger" className="mb-4">
          {t('document_not_found')}
        </Alert>
      )}

      {error && !isLoading && (
        <Alert type="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {isLoading && (
        <Card
          title={documentTitle}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <div className="flex justify-start py-4 sm:py-6 px-4 sm:px-6">
            <Spinner />
          </div>
        </Card>
      )}

      {document && !isLoading && (
        <Card
          title={
            <div className="flex space-x-4 items-center">
              <span>{document.description || documentTitle}</span>

              {document && !isLoading && (
                <Badge
                  variant={
                    (STATUS_VARIANTS[
                      document.status_id as keyof typeof STATUS_VARIANTS
                    ] || 'primary') as BadgeVariant
                  }
                >
                  {STATUS_LABELS[
                    document.status_id as keyof typeof STATUS_LABELS
                  ] || 'Unknown'}
                </Badge>
              )}
            </div>
          }
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <div className="flex flex-wrap gap-4 px-4 sm:px-6 pt-2 pb-4">
            <Invitations document={document} />

            <div className="flex-1">
              {isTimelineLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <TimelineLayout items={timelineData || []} />
              )}
            </div>
          </div>
        </Card>
      )}
    </Default>
  );
}
