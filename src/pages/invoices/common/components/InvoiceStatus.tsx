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
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceStatus as InvoiceStatusEnum } from '$app/common/enums/invoice-status';

interface Props {
  entity: Invoice;
}

export function InvoiceStatus(props: Props) {
  const [t] = useTranslation();

  const checkInvoiceInvitationsViewedDate = () => {
    return props.entity.invitations.some(
      (invitation) => invitation.viewed_date
    );
  };

  if (props.entity.is_deleted)
    return <Badge variant="red">{t('deleted')}</Badge>;

  if (props.entity.archived_at)
    return <Badge variant="orange">{t('archived')}</Badge>;

  if (props.entity.due_date && new Date(props.entity.due_date) < new Date())
    return <Badge variant="yellow">{t('overdue')}</Badge>;

  if (
    props.entity.status_id === InvoiceStatusEnum.Sent &&
    checkInvoiceInvitationsViewedDate()
  )
    return <Badge variant="yellow">{t('viewed')}</Badge>;

  switch (props.entity.status_id) {
    case '1':
      return <Badge variant="generic">{t('draft')}</Badge>;
    case '2':
      return <Badge variant="light-blue">{t('sent')}</Badge>;
    case '3':
      return <Badge variant="dark-blue">{t('partial')}</Badge>;
    case '4':
      return <Badge variant="green">{t('paid')}</Badge>;
    case '5':
      return <Badge variant="black">{t('cancelled')}</Badge>;
    case '6':
      return <Badge variant="purple">{t('reversed')}</Badge>;

    default:
      return <Badge variant="light-blue">{t('reversed')}</Badge>;
  }
}
