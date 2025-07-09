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

const STATUS_VARIANTS = {
  1: 'generic',
  2: 'light-blue',
  3: 'orange',
  4: 'green',
  5: 'red',
};

export function useTableColumns() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const STATUS_LABELS = {
    1: t('draft'),
    2: t('sent'),
    3: t('viewed'),
    4: t('completed'),
    5: t('cancelled'),
  };

  const columns: DataTableColumns<Document> = [
    {
      id: 'id',
      label: t('id'),
      format: (_, document) => (
        <Link
          to={route('/documents/:id', {
            id: document.id,
          })}
        >
          {document.id.slice(-8)}
        </Link>
      ),
    },
    {
      id: 'description',
      label: t('description'),
      format: (_, document) => document.description || t('untitled_document'),
    },
    {
      id: 'files',
      label: t('files'),
      format: (_, document) => (
        <>
          {document.files && document.files.length > 0 ? (
            <div>
              <div className="font-medium">{document.files[0].filename}</div>
              {document.files.length > 1 && (
                <div className="text-xs">
                  +{document.files.length - 1} more files
                </div>
              )}
              <div className="text-xs">
                {document.files[0].page_count}{' '}
                {document.files[0].page_count === 1 ? 'page' : 'pages'}
              </div>
            </div>
          ) : (
            <span style={{ color: colors.$17 }}>{t('no_files')}.</span>
          )}
        </>
      ),
    },
    {
      id: 'status',
      label: t('status'),
      format: (_, document) => (
        <Badge
          variant={
            STATUS_VARIANTS[
              document.status_id as keyof typeof STATUS_VARIANTS
            ] as BadgeVariant
          }
        >
          {STATUS_LABELS[document.status_id as keyof typeof STATUS_LABELS]}
        </Badge>
      ),
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
