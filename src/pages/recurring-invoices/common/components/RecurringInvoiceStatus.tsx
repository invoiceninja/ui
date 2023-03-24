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
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { RecurringInvoiceStatus as RecurringInvoiceStatusEnum } from '$app/common/enums/recurring-invoice-status';

interface Props {
  entity: RecurringInvoice;
}

export function RecurringInvoiceStatus(props: Props) {
  const [t] = useTranslation();

  const {
    status_id,
    is_deleted,
    archived_at,
    last_sent_date,
    remaining_cycles,
  } = props.entity;

  const isDraft = status_id === RecurringInvoiceStatusEnum.DRAFT;
  const isDeleted = Boolean(is_deleted);
  const isArchived = Boolean(archived_at);
  const isPending =
    status_id === RecurringInvoiceStatusEnum.ACTIVE && !last_sent_date;
  const remainingCycles =
    remaining_cycles === -1 ? 'endless' : remaining_cycles;

  if (isDeleted) return <Badge variant="red">{t('deleted')}</Badge>;

  if (isArchived) return <Badge variant="orange">{t('archived')}</Badge>;

  if (!isDraft && remainingCycles === 0) {
    return <Badge variant="light-blue">{t('completed')}</Badge>;
  }

  if (isPending) {
    return <Badge variant="dark-blue">{t('pending')}</Badge>;
  }

  if (isDraft) {
    return <Badge variant="generic">{t('draft')}</Badge>;
  }

  if (status_id === RecurringInvoiceStatusEnum.ACTIVE) {
    return <Badge variant="green">{t('active')}</Badge>;
  }

  if (status_id === RecurringInvoiceStatusEnum.PAUSED) {
    return <Badge variant="orange">{t('paused')}</Badge>;
  }

  return <></>;
}
