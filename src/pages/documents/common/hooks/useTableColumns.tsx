/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Document } from '$app/common/interfaces/docuninja/api';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

export const STATUS_VARIANTS = {
  1: 'generic',
  2: 'light-blue',
  3: 'green',
  4: 'red',
  5: 'blue',
  6: 'dark-blue',
  7: 'orange',
  8: 'purple',
};

export function useTableColumns() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const STATUS_LABELS = {
    1: t('draft'),
    2: t('pending_approval'),
    3: t('approved'),
    4: t('rejected'),
    5: t('sent'),
    6: t('completed'),
    7: t('expired'),
    8: t('voided'),
  };

  const getName = (document: Document) => {
    const firstInvitation = document.invitations?.[0];

    if (firstInvitation) {
      if (firstInvitation.contact) {
        if (
          !firstInvitation.contact.first_name &&
          !firstInvitation.contact.last_name
        ) {
          return firstInvitation.contact.email;
        }

        return `${firstInvitation.contact.first_name} ${firstInvitation.contact.last_name}`;
      }

      if (firstInvitation.user) {
        if (
          !firstInvitation.user.first_name &&
          !firstInvitation.user.last_name
        ) {
          return firstInvitation.user.email;
        }

        return `${firstInvitation.user.first_name} ${firstInvitation.user.last_name}`;
      }
    }

    return '';
  };

  const documentStatus = (document: Document) => {
    
    let variant = STATUS_VARIANTS[document.status_id as keyof typeof STATUS_VARIANTS] as BadgeVariant;
    let label = STATUS_LABELS[document.status_id as keyof typeof STATUS_LABELS];

    if (document.is_deleted) {
      variant = 'red';
      label = t('deleted');
    }
    else if (document.archived_at) {
      variant = 'orange';
      label = t('archived');
    }

    return (
      <Badge
        variant={variant}
      >
        {label}
      </Badge>
    );
  };

  const columns: DataTableColumns<Document> = [
    {
      id: 'id',
      label: t('signatory'),
      format: (_, document) => getName(document),
    },
    {
      id: 'description',
      label: t('description'),
      format: (_, document) => (
        <Link to={route('/documents/:id', { id: document.id })}>
          {document.description || t('untitled_document')}
        </Link>
      ),
    },
    {
      id: 'files',
      label: t('files'),
      format: (_, document) => (
        <>
          {document.files && document.files.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                <span className="font-medium">
                  {document.files[0].page_count}
                </span>

                <span className="text-xs">
                  {document.files[0].page_count === 1 ? t('page') : t('pages')}
                </span>
              </div>

              <div>
                <span className="text-gray-900 font-medium">
                  {document.files[0].filename.split('.')[0]}
                </span>
                {document.files.length > 1 && (
                  <span className="ml-2" style={{ color: colors.$17 }}>
                    & {document.files.length - 1} more
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </>
      ),
    },
    {
      id: 'status',
      label: t('status'),
      format: (_, document) => documentStatus(document),
    },
    {
      id: 'created_at',
      label: t('created_at'),
      format: (_, document) => (
        <>
          {document.files && document.files.length > 0
            ? date(document.files[0].created_at, dateFormat)
            : '-'}
        </>
      ),
    },
  ];

  return columns;
}
