/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { Task } from '$app/common/interfaces/task';
import { StatusBadge } from '$app/components/StatusBadge';

interface Props {
  entity: Task;
}

export function TaskStatus(props: Props) {
  const [t] = useTranslation();

  const { is_running, invoice_id, archived_at, is_deleted } = props.entity;

  if (is_deleted) return <Badge variant="red">{t('deleted')}</Badge>;

  if (archived_at) return <Badge variant="orange">{t('archived')}</Badge>;

  if (invoice_id) return <Badge variant="green">{t('invoiced')}</Badge>;

  if (is_running) return <Badge variant="light-blue">{t('running')}</Badge>;

  return <StatusBadge for={{}} code={props.entity.status?.name || 'logged'} />;
}
