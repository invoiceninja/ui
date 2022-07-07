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
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Task } from 'common/interfaces/task';
import { CustomField } from 'components/CustomField';
import { useTranslation } from 'react-i18next';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
}

export function TaskDetails(props: Props) {
  const [t] = useTranslation();

  const { task, handleChange } = props;

  const company = useCurrentCompany();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <InputField
        label={t('task_number')}
        value={task?.number}
        onValueChange={(value) => handleChange('number', value)}
      />

      <InputField
        label={t('rate')}
        value={task?.rate}
        onValueChange={(value) => handleChange('rate', value)}
      />

      <SelectField
        label={t('status')}
        value={task?.status_id}
        onValueChange={(value) => handleChange('status_id', value)}
      >
        <option value="">{t('backlog')}</option>
        <option value="">{t('ready_to_do')}</option>
        <option value="">{t('in_progress')}</option>
        <option value="">{t('done')}</option>
      </SelectField>

      {task && company?.custom_fields?.task1 && (
        <CustomField
          field="task1"
          defaultValue={task?.custom_value1 || ''}
          value={company.custom_fields.task1}
          onChange={(value) => handleChange('custom_value1', value)}
          noExternalPadding
        />
      )}

      {task && company?.custom_fields?.task2 && (
        <CustomField
          field="task2"
          defaultValue={task?.custom_value2 || ''}
          value={company.custom_fields.task2}
          onChange={(value) => handleChange('custom_value2', value)}
          noExternalPadding
        />
      )}
    </Card>
  );
}
