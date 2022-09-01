/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from 'components/Badge';
import { useTranslation } from 'react-i18next';
import { Expense } from 'common/interfaces/expense';

interface Props {
  entity: Expense;
}

export function ExpenseStatus(props: Props) {
  const [t] = useTranslation();

  if(props.entity.should_be_invoiced && !props.entity.payment_date)
    return <Badge variant="dark-blue">{t('pending')}</Badge>;

  if(props.entity.payment_date)
    return <Badge variant="light-blue">{t('paid')}</Badge>;

    return <Badge variant="generic">{t('logged')}</Badge>;

    return <></>;
}
