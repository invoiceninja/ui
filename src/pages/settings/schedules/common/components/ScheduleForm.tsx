/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTranslation } from 'react-i18next';
import frequencies from '$app/common/constants/frequency';
import { Divider } from '$app/components/cards/Divider';
import { EmailStatement } from './EmailStatement';
import { EmailRecord } from '$app/pages/settings/schedules/common/components/EmailRecord';
import {
  Template,
  useDisplayTemplateField,
} from '../hooks/useDisplayTemplateField';
import { EmailReport } from './EmailReport';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
  page?: 'create' | 'edit';
}

export enum Templates {
  EMAIL_STATEMENT = 'email_statement',
  EMAIL_RECORD = 'email_record',
  EMAIL_REPORT = 'email_report',
}

export function ScheduleForm(props: Props) {
  const [t] = useTranslation();

  const { schedule, handleChange, errors, page } = props;

  const displayTemplateField = useDisplayTemplateField({
    template: schedule.template as Template,
  });

  return (
    <Card title={page === 'edit' ? t('edit_schedule') : t('new_schedule')}>
      {displayTemplateField('template') && (
        <Element leftSide={t('template')} required>
          <SelectField
            value={schedule.template}
            onValueChange={(value) => handleChange('template', value)}
            errorMessage={errors?.errors.template}
          >
            <option value="email_statement">{t('email_statement')}</option>
            <option value="email_record">{t('email_record')}</option>
            <option value="email_report">{t('email_report')}</option>
          </SelectField>
        </Element>
      )}

      {displayTemplateField('next_run') && (
        <Element leftSide={t('next_run')} required>
          <InputField
            type="date"
            value={schedule.next_run}
            onValueChange={(value) => handleChange('next_run', value)}
            errorMessage={errors?.errors.next_run}
          />
        </Element>
      )}

      {displayTemplateField('frequency') && (
        <Element leftSide={t('frequency')}>
          <SelectField
            value={schedule.frequency_id}
            onValueChange={(value) => handleChange('frequency_id', value)}
            errorMessage={errors?.errors.frequency_id}
          >
            {Object.keys(frequencies).map((frequency, index) => (
              <option key={index} value={frequency}>
                {t(frequencies[frequency as keyof typeof frequencies])}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {displayTemplateField('remaining_cycles') && (
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
      )}

      {schedule.template && <Divider />}

      {schedule.template === Templates.EMAIL_STATEMENT && (
        <EmailStatement
          schedule={schedule}
          handleChange={handleChange}
          errors={errors}
          page={page}
        />
      )}

      {schedule.template === Templates.EMAIL_RECORD && (
        <EmailRecord
          schedule={schedule}
          handleChange={handleChange}
          errors={errors}
        />
      )}

      {schedule.template === Templates.EMAIL_REPORT && (
        <EmailReport
          schedule={schedule}
          handleChange={handleChange}
          errors={errors}
        />
      )}
    </Card>
  );
}
