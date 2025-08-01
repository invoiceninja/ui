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
import { useColorScheme } from '$app/common/colors';
import { InvoiceOutstandingTasks } from './InvoiceOutstandingTasks';
import { PaymentSchedule } from './PaymentSchedule';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
  setErrors: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>;
  page?: 'create' | 'edit';
}

export enum Templates {
  EMAIL_STATEMENT = 'email_statement',
  EMAIL_RECORD = 'email_record',
  EMAIL_REPORT = 'email_report',
  INVOICE_OUTSTANDING_TASKS = 'invoice_outstanding_tasks',
  PAYMENT_SCHEDULE = 'payment_schedule',
}

export function ScheduleForm(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { schedule, handleChange, errors, setErrors, page } = props;

  const displayTemplateField = useDisplayTemplateField({
    template: schedule.template as Template,
  });

  return (
    <Card
      title={page === 'edit' ? t('edit_schedule') : t('new_schedule')}
      className="shadow-sm pb-6"
      childrenClassName="pt-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      {displayTemplateField('template') && (
        <Element leftSide={t('template')} required>
          <SelectField
            value={schedule.template}
            onValueChange={(value) => handleChange('template', value)}
            errorMessage={errors?.errors.template}
            customSelector
            dismissable={false}
            disabled={page === 'edit'}
          >
            <option value="email_statement">{t('email_statement')}</option>
            <option value="email_record">{t('email_record')}</option>
            <option value="email_report">{t('email_report')}</option>
            <option value="invoice_outstanding_tasks">{t('invoice_outstanding_tasks')}</option>
            <option value="payment_schedule">{t('payment_schedule')}</option>
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
            value={schedule.frequency_id?.toString()}
            onValueChange={(value) => handleChange('frequency_id', value)}
            errorMessage={errors?.errors.frequency_id}
            customSelector
            dismissable={false}
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
            value={schedule.remaining_cycles?.toString()}
            onValueChange={(value) =>
              handleChange('remaining_cycles', parseInt(value))
            }
            errorMessage={errors?.errors.remaining_cycles}
            customSelector
            dismissable={false}
          >
            <option value="-1">{t('endless')}</option>
            {[...Array(60).keys()].map((number, index) => (
              <option value={number.toString()} key={index}>
                {number}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {schedule.template && (
        <div className="px-4 sm:px-6 py-4">
          <Divider
            className="border-dashed"
            withoutPadding
            borderColor={colors.$20}
          />
        </div>
      )}

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

      {schedule.template === Templates.INVOICE_OUTSTANDING_TASKS && (
        <InvoiceOutstandingTasks
          schedule={schedule}
          handleChange={handleChange}
          errors={errors}
        />
      )}

      {schedule.template === Templates.PAYMENT_SCHEDULE && (
        <PaymentSchedule
          schedule={schedule}
          handleChange={handleChange}
          errors={errors}
          setErrors={setErrors}
          page={page}
        />
      )}
    </Card>
  );
}
