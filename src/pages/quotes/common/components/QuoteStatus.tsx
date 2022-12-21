/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Quote } from 'common/interfaces/quote';
import { Badge } from 'components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  entity: Quote;
}

export function QuoteStatus(props: Props) {
  const [t] = useTranslation();

  if (props.entity.is_deleted)
    return <Badge variant="red">{t('deleted')}</Badge>;

  if (props.entity.archived_at)
    return <Badge variant="orange">{t('archived')}</Badge>;

  if (props.entity.invoice_id)
    return <Badge variant="green">{t('converted')}</Badge>;

  if (
    props.entity.status_id === '2' &&
    new Date(props.entity.date) < new Date()
  )
    return <Badge variant="red">{t('expired')}</Badge>;

  switch (props.entity.status_id) {
    case '1':
      return <Badge variant="generic">{t('draft')}</Badge>;
    case '2':
      return <Badge variant="light-blue">{t('sent')}</Badge>;
    case '3':
      return <Badge variant="dark-blue">{t('approved')}</Badge>;
    default:
      return <Badge variant="light-blue">{t('error')}</Badge>;
  }
}
