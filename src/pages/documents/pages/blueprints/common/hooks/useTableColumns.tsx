/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { DataTableColumns } from '$app/components/DataTable';
import { Link } from '$app/components/forms';

export function useTableColumns() {
  const [t] = useTranslation();

  const getBadge = (blueprint: Blueprint) => {
    let variant: BadgeVariant;
    let label: string;

    if (blueprint.is_deleted === true) {
      variant = 'red';
      label = t('deleted');
    } else if (blueprint.archived_at !== null) {
      variant = 'orange';
      label = t('archived');
    } else {
      variant = 'green';
      label = t('active');
    }

    return <Badge variant={variant}>{label}</Badge>;
  };

  const blueprintType = (blueprint: Blueprint) => {
    if (blueprint.template_kind === 'authored_document') {
      return 'WYSIWYG document';
    }

    if (blueprint.template_kind === 'uploaded_pdf') {
      return 'Uploaded PDF';
    }

    if (blueprint.design_hash?.length && blueprint.design_hash.length > 0) {
      const entity = blueprint.document?.metadata?.entity_type ?? 'ninja';
      return `${t(entity)} ${t('design')}`;
    }

    return t('custom');
  };

  const columns: DataTableColumns<Blueprint> = [
    {
      id: 'status',
      label: t('status'),
      format: (field, blueprint) => getBadge(blueprint),
    },
    {
      id: 'name',
      label: t('name'),
      format: (field, blueprint) => (
        <Link
          to={route(
            blueprint.template_kind === 'authored_document'
              ? '/docuninja/templates/:id/document-editor'
              : '/docuninja/templates/:id/edit',
            { id: blueprint.id }
          )}
        >
          <span className="truncate block max-w-xs">
            {blueprint.name || t('untitled_template')}
          </span>
        </Link>
      ),
    },
    {
      id: 'type',
      label: t('type'),
      format: (field, blueprint) => blueprintType(blueprint),
    },
  ];

  return columns;
}
