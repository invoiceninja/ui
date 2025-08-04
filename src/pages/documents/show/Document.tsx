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
import { useEffect, useMemo, useState } from 'react';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { Spinner } from '$app/components/Spinner';
import { Button } from '$app/components/forms';
import type { DocumentFile } from '$app/common/interfaces/docuninja/api';
import { TimelineLayout } from './components/TimelineLayout';
import { Invitations } from './components/Invitations';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { useDocumentActions } from './hooks/useDocumentActions';

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

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

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

  const {
    data: document,
    isLoading,
    error,
  } = useDocumentQuery({
    id,
    enabled: Boolean(id),
  });

  const actions = useDocumentActions({ document });

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

  const handlePreview = (file: DocumentFile) => {
    console.log('Preview file:', file.id);
    // Implement preview logic here
  };

  useEffect(() => {
    if (document) {
      document.invitations = [
        {
          id: '01K0HQQSGRREYSJ4H69NEXNHHH',
          user_id: '01JZB0G53CX8METSW0CPJH7FW2',
          user: {
            id: '01JZB0G53CX8METSW0CPJH7FW2',
            account_id: '01JZB0G53CX8METSW0CPJH7FW2',
            phone_number_verified: false,
            referral_code: null,
            oauth_user_id: null,
            oauth_user_token: null,
            oauth_provider_id: null,
            google_2fa_secret: null,
            accepted_terms_version: null,
            avatar: '',
            e_signature: null,
            e_initials: null,
            created_at: '2025-07-04T15:22:23.000000Z',
            updated_at: '2025-07-06T03:56:57.000000Z',
            archived_at: null,
            email_verified_at: '2025-07-06T03:56:57.000000Z',
            companies: [],
            account: null,
            permissions: [],
            first_name: '',
            last_name: '',
            email: 'user@example.com',
            phone_number: '',
            is_deleted: 0,
            company_user: {
              is_admin: true,
              is_owner: true,
              notifications: ['all'],
              created_at: '2025-07-04T15:22:23.000000Z',
              updated_at: '2025-07-04T15:22:23.000000Z',
              archived_at: null,
              id: '01JZB0G53CX8METSW0CPJH7FW2',
              account_id: '01JZB0G53CX8METSW0CPJH7FW2',
              company_id: '01JZB0G53CX8METSW0CPJH7FW2',
              user_id: '01JZB0G53CX8METSW0CPJH7FW2',
              permissions: [],
              role: 'admin',
            },
          },
          contact: {
            id: '01K0EWHV909RSF8XYWVTKRN8BY',
            user_id: '01JZB0G53CX8METSW0CPJH7FW2',
            client_id: '01K0EWHV8WTS3DZGZSM15KY7AB',
            first_name: '',
            last_name: '',
            phone: '',
            email: 'abedinhalilovic123345@gmail.com',
            is_primary: false,
            email_verified_at: null,
            last_login: null,
            created_at: '2025-07-18 13:46:03',
            updated_at: '2025-07-18 13:46:03',
            archived_at: null,
            e_signature: null,
            e_initials: null,
            contact_key: 'ebPLG7eTVQvbLnm4NH35wlNoQ5jaMO8D',
            company_id: '01JZB0G53CX8METSW0CPJH7FW2',
            signature_base64: null,
            initials_base64: null,
          },
          client_contact_id: '01K0EWHV909RSF8XYWVTKRN8BY',
          client_id: '01K0EWHV8WTS3DZGZSM15KY7AB',
          message_id: '',
          email_error: '',
          entity: 'contact',
          sent_date: null,
          viewed_date: null,
          opened_date: null,
          signed_date: null,
          created_at: '2025-07-19 16:19:39',
          updated_at: '2025-07-19 16:19:39',
          archived_at: null,
          ip_address: null,
          company_id: '01JZB0G53CX8METSW0CPJH7FW2',
          document_id: '01K0HQQSGRREYSJ4H69NEXNHHH',
        },
      ];
    }
  }, [document]);

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
            disabled={isFormBusy}
            disableWithoutIcon
          >
            {t('edit')}
          </Button>

          <Dropdown
            className="rounded-bl-none rounded-tl-none h-full px-1 border-l-1 border-y-0 border-r-0"
            cardActions
            disabled={isFormBusy}
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
          childrenClassName="px-4 sm:px-6"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <div className="flex flex-col xl:flex-row justify-between gap-4 pt-3 w-full">
            <div className="flex">
              <Invitations document={document} />
            </div>

            <div className="flex-1">
              {isTimelineLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <TimelineLayout
                  items={[
                    {
                      id: 1,
                      title: 'Document sent',
                      description:
                        'Document not yet sent to   [abedinhalilovic123345@gmail.com]',
                      time: '',
                      completed: false,
                      status: '',
                    },
                    {
                      id: 2,
                      title: 'Document viewed',
                      description: 'Pending',
                      time: '',
                      completed: false,
                      status: '',
                    },
                    {
                      id: 3,
                      title: 'Document signed',
                      description: 'Pending',
                      time: '',
                      completed: false,
                      status: '',
                    },
                    {
                      id: 4,
                      title: 'Document completion',
                      description: 'Pending',
                      time: '',
                      completed: false,
                      status: '',
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </Card>
      )}
    </Default>
  );
}
