/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { transactionStatuses } from '$app/common/constants/transactions';
import { TransactionStatus } from '$app/common/enums/transactions';
import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  route: string;
  status: string;
}

export function EntityStatus(props: Props) {
  const [t] = useTranslation();

  if (TransactionStatus.Unmatched === props.status) {
    return (
      <Link to={props.route}>
        <Badge variant="generic">{t(transactionStatuses[1])}</Badge>
      </Link>
    );
  }

  if (TransactionStatus.Matched === props.status) {
    return (
      <Link to={props.route}>
        <Badge variant="dark-blue">{t(transactionStatuses[2])}</Badge>
      </Link>
    );
  }

  if (TransactionStatus.Converted === props.status) {
    return (
      <Link to={props.route}>
        <Badge variant="green">{t(transactionStatuses[3])}</Badge>
      </Link>
    );
  }

  return <></>;
}
