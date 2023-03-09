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

interface Props {
  entity: Quote;
}

export function QuoteStatus(props: Props) {
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

  if (props.entity.invoice_id)
    return <Badge variant="green">{t('converted')}</Badge>;

  if (
    props.entity.status_id === QuoteStatusEnum.Sent &&
    checkInvoiceInvitationsViewedDate()
  )
    return <Badge variant="yellow">{t('viewed')}</Badge>;

  switch (props.entity.status_id) {
    case QuoteStatusEnum.Draft:
      return <Badge variant="generic">{t('draft')}</Badge>;
    case QuoteStatusEnum.Sent:
      return <Badge variant="light-blue">{t('sent')}</Badge>;
    case QuoteStatusEnum.Approved:
      return <Badge variant="dark-blue">{t('approved')}</Badge>;
    case QuoteStatusEnum.Expired:
      return <Badge variant="red">{t('expired')}</Badge>;
    default:
      return <Badge variant="light-blue">{t('error')}</Badge>;
  }
}
