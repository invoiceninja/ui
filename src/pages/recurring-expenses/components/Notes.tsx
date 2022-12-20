/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';
import { RecurringExpenseCardProps } from './Details';

export function Notes(props: RecurringExpenseCardProps) {
  const [t] = useTranslation();

  const { recurringExpense, handleChange } = props;

  return (
    <Card title={t('notes')} isLoading={!recurringExpense} withContainer>
      {recurringExpense && (
        <InputField
          element="textarea"
          label={t('public_notes')}
          value={recurringExpense.public_notes}
          onValueChange={(value) => handleChange('public_notes', value)}
        />
      )}

      {recurringExpense && (
        <InputField
          element="textarea"
          label={t('private_notes')}
          value={recurringExpense.private_notes}
          onValueChange={(value) => handleChange('private_notes', value)}
        />
      )}
    </Card>
  );
}
