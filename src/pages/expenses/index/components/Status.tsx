/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Expense } from 'common/interfaces/expense';
import { useTranslation } from 'react-i18next';

interface Props {
  expense: Expense;
}

export function Status(props: Props) {
  const [t] = useTranslation();

  if (props.expense.should_be_invoiced) {
    return <span>{t('pending')}</span>;
  }

  if (props.expense.invoice_id) {
    return <span>{t('invoiced')}</span>;
  }

  return <span>{t('logged')}</span>;
}
