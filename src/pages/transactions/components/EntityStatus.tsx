/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { transactionStatuses } from '$app/common/constants/transactions';
import { TransactionStatus } from '$app/common/enums/transactions';
import { Transaction } from '$app/common/interfaces/transactions';
import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  transaction: Transaction;
}

export function EntityStatus(props: Props) {
  const [t] = useTranslation();

  const { is_deleted, archived_at, status_id } = props.transaction;

  if (is_deleted) {
    return <Badge variant="red">{t('deleted')}</Badge>;
  }

  if (archived_at) {
    return <Badge variant="orange">{t('archived')}</Badge>;
  }

  if (TransactionStatus.Unmatched === status_id) {
    return <Badge variant="generic">{t(transactionStatuses[1])}</Badge>;
  }

  if (TransactionStatus.Matched === status_id) {
    return <Badge variant="dark-blue">{t(transactionStatuses[2])}</Badge>;
  }

  if (TransactionStatus.Converted === status_id) {
    return <Badge variant="green">{t(transactionStatuses[3])}</Badge>;
  }

  return <></>;
}
