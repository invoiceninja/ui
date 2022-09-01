/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from 'components/Badge';
import { useTranslation } from 'react-i18next';
import { Task } from 'common/interfaces/task';
import { StatusBadge } from 'components/StatusBadge';

interface Props {
  entity: Task;
}

export function TaskStatus(props: Props) {
  const [t] = useTranslation();

  if(props.entity.is_deleted)
    return <Badge variant="red">{t('deleted')}</Badge>;

  if(props.entity.archived_at)
    return <Badge variant="orange">{t('archived')}</Badge>;

  if(props.entity.invoice_id)
    return <Badge variant="green">{t('invoiced')}</Badge>;

    return <StatusBadge for={{}} code={props.entity.status?.name || 'logged'} />

    return <></>;
}
