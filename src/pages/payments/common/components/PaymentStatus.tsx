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
import { Payment } from '$app/common/interfaces/payment';

interface Props {
  entity: Payment;
}

export function PaymentStatus(props: Props) {
  const [t] = useTranslation();

  if (props.entity.is_deleted)
    return <Badge variant="red">{t('deleted')}</Badge>;

  if (props.entity.archived_at)
    return <Badge variant="orange">{t('archived')}</Badge>;

  if (props.entity.applied < props.entity.amount)
    return <Badge variant="generic">{t('unapplied')}</Badge>;

  switch (props.entity.status_id) {
    case '1':
      return <Badge variant="generic">{t('payment_status_1')}</Badge>;
    case '2':
      return <Badge variant="light-blue">{t('payment_status_2')}</Badge>;
    case '3':
      return <Badge variant="red">{t('payment_status_3')}</Badge>;
    case '4':
      return <Badge variant="green">{t('payment_status_4')}</Badge>;
    case '5':
      return <Badge variant="dark-blue">{t('payment_status_5')}</Badge>;
    case '6':
      return <Badge variant="generic">{t('payment_status_6')}</Badge>;

    default:
      return <Badge variant="light-blue">{t('payment_status_1')}</Badge>;
      break;
  }

  return <></>;
}
