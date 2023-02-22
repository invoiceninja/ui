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
import { InputField, SelectField } from '@invoiceninja/forms';
import { Schedule } from 'common/interfaces/schedule';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useTranslation } from 'react-i18next';
import frequencies from 'common/constants/frequency';
import { Divider } from 'components/cards/Divider';
import { EmailStatement } from './EmailStatement';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
}

export function ScheduleForm(props: Props) {
  const [t] = useTranslation();

  const { schedule, handleChange, errors } = props;

  return (
    <Card title={t('new_schedule')}>
      <Element leftSide={t('name')} required>
        <InputField
          value={schedule.name}
          onValueChange={(value) => handleChange('name', value)}
          errorMessage={errors?.errors.name}
        />
      </Element>

      <Element leftSide={t('template')} required>
        <SelectField
          value={schedule.template}
          onValueChange={(value) => handleChange('template', value)}
          errorMessage={errors?.errors.template}
        >
          <option value="email_statement">{t('email_statement')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('next_run')} required>
        <InputField
          type="date"
          value={schedule.next_run}
          onValueChange={(value) => handleChange('next_run', value)}
          errorMessage={errors?.errors.next_run}
        />
      </Element>

      <Element leftSide={t('frequency')}>
        <SelectField
          value={schedule.frequency_id}
          onValueChange={(value) => handleChange('frequency_id', value)}
        >
          {Object.keys(frequencies).map((frequency, index) => (
            <option key={index} value={frequency}>
              {t(frequencies[frequency as keyof typeof frequencies])}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('remaining_cycles')}>
        <SelectField
          value={schedule.remaining_cycles}
          onValueChange={(value) =>
            handleChange('remaining_cycles', parseInt(value))
          }
          errorMessage={errors?.errors.remaining_cycles}
        >
          <option value="-1">{t('endless')}</option>
          {[...Array(60).keys()].map((number, index) => (
            <option value={number} key={index}>
              {number}
            </option>
          ))}
        </SelectField>
      </Element>

      {schedule.template && <Divider />}

      {schedule.template === 'email_statement' && (
        <EmailStatement
          schedule={schedule}
          handleChange={handleChange}
          errors={errors}
        />
      )}
    </Card>
  );
}
