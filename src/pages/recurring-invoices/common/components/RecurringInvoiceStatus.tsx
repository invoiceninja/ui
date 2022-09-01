/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from 'common/enums/entity-state';
import { getEntityState } from 'common/helpers';
import { Badge } from 'components/Badge';
import { useTranslation } from 'react-i18next';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';

interface Props {
  entity: RecurringInvoice;
}

export function RecurringInvoiceStatus(props: Props) {
  const [t] = useTranslation();

  if(props.entity.is_deleted)
    return <Badge variant="red">{t('deleted')}</Badge>;

  if(props.entity.archived_at)
    return <Badge variant="orange">{t('archived')}</Badge>;

  const next_send_date = new Date(props.entity.next_send_date)
  const today = new Date();

  if(props.entity.status_id == "2" && (next_send_date > today))
    return <Badge variant="generic">{t('pending')}</Badge>;

    switch (props.entity.status_id) {
      case "1":
        return <Badge variant="generic">{t('draft')}</Badge>;
      case "2":
        return <Badge variant="green">{t('active')}</Badge>;
      case "3":
        return <Badge variant="dark-blue">{t('partial')}</Badge>;
      case "4":
        return <Badge variant="green">{t('completed')}</Badge>;
      case "5":
        return <Badge variant="black">{t('cancelled')}</Badge>;
      case "6":
        return <Badge variant="light-blue">{t('sent')}</Badge>;

      default:
        return <Badge variant="light-blue">{t('sent')}</Badge>;
        break;
    }

    return <></>;
}
