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
import { PurchaseOrderStatus as PurchaseOrderStatusEnum } from '$app/common/enums/purchase-order-status';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';

interface Props {
  entity: PurchaseOrder;
}

export function PurchaseOrderStatus(props: Props) {
  const [t] = useTranslation();

  const { status_id, archived_at, is_deleted, invitations } = props.entity;

  const checkPurchaseOrderInvitationsViewedDate = () => {
    return invitations.some((invitation) => invitation.viewed_date);
  };

  const isDraft = status_id === PurchaseOrderStatusEnum.Draft;
  const isSent = !isDraft;
  const isViewed = checkPurchaseOrderInvitationsViewedDate();
  const isCancelled = status_id === PurchaseOrderStatusEnum.Cancelled;
  const isAccepted = status_id === PurchaseOrderStatusEnum.Accepted;

  if (is_deleted) {
    return <Badge variant="red">{t('deleted')}</Badge>;
  }

  if (archived_at) {
    return <Badge variant="orange">{t('archived')}</Badge>;
  }

  if (isCancelled) {
    return <Badge variant="black">{t('cancelled')}</Badge>;
  }

  if (status_id === PurchaseOrderStatusEnum.Received) {
    return <Badge variant="green">{t('received')}</Badge>;
  }

  if (isAccepted) {
    return <Badge variant="dark-blue">{t('accepted')}</Badge>;
  }

  if (isSent) {
    return <Badge variant="light-blue">{t('sent')}</Badge>;
  }

  if (isDraft) {
    return <Badge variant="generic">{t('draft')}</Badge>;
  }

  if (isViewed && !isCancelled && !isAccepted) {
    return <Badge variant="yellow">{t('viewed')}</Badge>;
  }

  return <></>;
}
