/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { ExpenseCardProps } from './Details';

export function Notes(props: ExpenseCardProps) {
  const [t] = useTranslation();
  const { expense, handleChange, errors } = props;

  return (
    <Card title={t('notes')} isLoading={!expense} withContainer>
      {expense && (
        <InputField
          value={expense.public_notes}
          label={t('public_notes')}
          element="textarea"
          onValueChange={(value) => handleChange('public_notes', value)}
          errorMessage={errors?.errors.public_notes}
        />
      )}

      {expense && (
        <InputField
          value={expense.private_notes}
          label={t('private_notes')}
          element="textarea"
          onValueChange={(value) => handleChange('private_notes', value)}
          errorMessage={errors?.errors.private_notes}
        />
      )}
    </Card>
  );
}
