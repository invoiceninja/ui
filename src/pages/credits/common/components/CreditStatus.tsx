/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Credit } from '$app/common/interfaces/credit';
import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { CreditStatus as CreditStatusEnum } from '$app/common/enums/credit-status';

interface Props {
  entity: Credit;
}

export function CreditStatus(props: Props) {
  const [t] = useTranslation();

  const { status_id, is_deleted, archived_at, invitations } = props.entity;

  const checkCreditInvitationsViewedDate = () => {
    return invitations.some((invitation) => invitation.viewed_date);
  };

  const isApplied = status_id === CreditStatusEnum.Applied;
  const isUnpaid = !isApplied;
  const isViewed = checkCreditInvitationsViewedDate();

  if (is_deleted) return <Badge variant="red">{t('deleted')}</Badge>;

  if (archived_at) return <Badge variant="orange">{t('archived')}</Badge>;

  if (isViewed && isUnpaid) {
    return <Badge variant="light-blue">{t('viewed')}</Badge>;
  }

  if (status_id === CreditStatusEnum.Draft) {
    return <Badge variant="generic">{t('draft')}</Badge>;
  }

  if (status_id === CreditStatusEnum.Sent) {
    return <Badge variant="light-blue">{t('sent')}</Badge>;
  }

  if (status_id === CreditStatusEnum.Partial) {
    return <Badge variant="dark-blue">{t('partial')}</Badge>;
  }

  if (status_id === CreditStatusEnum.Applied) {
    return <Badge variant="green">{t('applied')}</Badge>;
  }

  return <></>;
}
