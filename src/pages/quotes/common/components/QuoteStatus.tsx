/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Quote } from '$app/common/interfaces/quote';
import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { QuoteStatus as QuoteStatusEnum } from '$app/common/enums/quote-status';
import dayjs from 'dayjs';

interface Props {
  entity: Quote;
}

export function QuoteStatus(props: Props) {
  const [t] = useTranslation();

  const {
    status_id,
    is_deleted,
    archived_at,
    invoice_id,
    invitations,
    partial,
    partial_due_date,
    due_date,
    balance,
  } = props.entity;

  const checkQuoteInvitationsViewedDate = () => {
    return invitations.some((invitation) => invitation.viewed_date);
  };

  const isSent = status_id !== QuoteStatusEnum.Draft;
  const isApproved =
    status_id === QuoteStatusEnum.Approved ||
    status_id === QuoteStatusEnum.Converted;
  const isUnpaid = !isApproved;
  const isViewed = checkQuoteInvitationsViewedDate();

  const isPastDue = () => {
    const date =
      partial !== 0 && partial_due_date ? partial_due_date : due_date;

    if (!date || balance === 0) {
      return false;
    }

    const isLessForOneDay =
      dayjs(date).diff(dayjs().format('YYYY-MM-DD'), 'day') <= -1;

    return !is_deleted && isSent && isUnpaid && isLessForOneDay;
  };

  if (is_deleted) return <Badge variant="red">{t('deleted')}</Badge>;

  if (archived_at) return <Badge variant="orange">{t('archived')}</Badge>;

  if (invoice_id) return <Badge variant="green">{t('converted')}</Badge>;

  if (isPastDue() || QuoteStatusEnum.Expired) return <Badge variant="red">{t('expired')}</Badge>;

  if (isViewed && isUnpaid && !isApproved) {
    return <Badge variant="yellow">{t('viewed')}</Badge>;
  }

  if (status_id === QuoteStatusEnum.Draft) {
    return <Badge variant="generic">{t('draft')}</Badge>;
  }

  if (status_id === QuoteStatusEnum.Sent) {
    return <Badge variant="light-blue">{t('sent')}</Badge>;
  }

  if (status_id === QuoteStatusEnum.Approved) {
    return <Badge variant="dark-blue">{t('approved')}</Badge>;
  }

  return <></>;
}
