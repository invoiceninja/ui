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
import { MdEdit } from 'react-icons/md';
import { DashboardCardField } from '$app/common/interfaces/company-user';
import { useColorScheme } from '$app/common/colors';
import { GridDotsVertical } from '$app/components/icons/GridDotsVertical';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { Icon } from '$app/components/icons/Icon';
import { FIELDS_LABELS } from './DashboardCardSelector';
import { PERIOD_LABELS } from './DashboardCard';

interface Props {
  decoded: DashboardCardField;
  onRemove?: () => void;
  onEdit?: () => void;
}

export function FieldRow({ decoded, onRemove, onEdit }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <>
      <div className="flex flex-1 items-center space-x-2">
        <GridDotsVertical size="1.2rem" color={colors.$17} />

        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {t(FIELDS_LABELS[decoded.field] ?? decoded.field)}
          </span>
          <span className="text-xs text-gray-500">
            {t(PERIOD_LABELS[decoded.period] ?? decoded.period)}
            {' · '}
            {t(decoded.calculate === 'avg' ? 'average' : decoded.calculate)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onEdit && (
          <div className="cursor-pointer" onClick={onEdit}>
            <Icon element={MdEdit} size={18} style={{ color: colors.$17 }} />
          </div>
        )}

        <div className={onRemove ? 'cursor-pointer' : ''} onClick={onRemove}>
          <CircleXMark
            color={colors.$16}
            hoverColor={colors.$3}
            borderColor={colors.$5}
            hoverBorderColor={colors.$17}
            size="1.6rem"
          />
        </div>
      </div>
    </>
  );
}
