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
import { useMemo } from 'react';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { Spinner } from '$app/components/Spinner';
import { Button } from '$app/components/forms';
import { TimelineLayout } from './components/TimelineLayout';
import { Invitations } from './components/Invitations';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { useDocumentActions } from './hooks/useDocumentActions';
import { STATUS_VARIANTS } from '../common/hooks/useTableColumns';

export default function Document() {
  const { documentTitle } = useTitle('view_document');
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const {
    data: document,
    isLoading,
    error,
    isFetching: isDocumentFetching,
  } = useDocumentQuery({
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

  const STATUS_LABELS = useMemo(
    () => ({
      1: t('draft'),
      2: t('pending_approval'),
      3: t('approved'),
      4: t('rejected'),
      5: t('sent'),
      6: t('completed'),
      7: t('expired'),
      8: t('voided'),
    }),
    []
  );

  const actions = useDocumentActions({ document });

  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isFetching: isTimelineFetching,
  } = useDocumentTimelineQuery({
    id,
    enabled: Boolean(id),
  });

  return (
    <Default
      title={document?.description || documentTitle}
      breadcrumbs={pages}
      docsLink="en/documents"
      navigationTopRight={
        <div className="flex">
          <Button
            className="rounded-br-none rounded-tr-none px-3"
            to={route('/documents/:id/builder', { id: document?.id })}
          >
            {t('edit')}
          </Button>

          <Dropdown
            className="rounded-bl-none rounded-tl-none h-full px-1 border-l-1 border-y-0 border-r-0"
            cardActions
            labelButtonBorderColor={colors.$1}
          >
            {actions}
          </Dropdown>
        </div>
      }
    >
      {!document && !isLoading && !error && (
        <Alert type="danger" className="mb-4">
          {t('document_not_found')}
        </Alert>
      )}

      {(isLoading ||
        isTimelineLoading ||
        isDocumentFetching ||
        isTimelineFetching) && (
        <Card
          title={documentTitle}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <div className="flex justify-center py-4 sm:py-6 px-4 sm:px-6">
            <Spinner />
          </div>
        </Card>
      )}

      {document &&
        !isLoading &&
        !isTimelineLoading &&
        !isTimelineFetching &&
        !isDocumentFetching && (
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
            childrenClassName="px-4 sm:px-6"
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
          >
            <div className="flex flex-col xl:flex-row justify-between gap-4 pt-3 pb-4 w-full">
              <div className="flex">
                <Invitations document={document} />
              </div>

              <div className="flex-1">
                <TimelineLayout items={timelineData || []} />
              </div>
            </div>
          </Card>
        )}
    </Default>
  );
}
