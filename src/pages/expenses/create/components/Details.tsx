/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Expense } from 'common/interfaces/expense';
import { useTranslation } from 'react-i18next';

interface Props {
  expense: Expense | undefined;
  setExpense: React.Dispatch<React.SetStateAction<Expense | undefined>>;
}

export function Details(props: Props) {
  const [t] = useTranslation();
  const { expense, setExpense } = props;

  return (
    <Card title={t('details')} isLoading={!expense}>
      {expense && <Element leftSide={t('vendor')}></Element>}
    </Card>
  );
}
