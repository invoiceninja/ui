/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { Frequency } from 'common/enums/frequency';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useShouldDisableAdvanceSettings } from 'common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from 'common/hooks/useTitle';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Schedule } from 'common/interfaces/schedule';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankScheduleQuery } from 'common/queries/schedules';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ScheduleForm } from '../common/components/ScheduleForm';
import { useHandleChange } from '../common/hooks/useHandleChange';

export function Create() {
  const { documentTitle } = useTitle('new_schedule');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('schedules'), href: '/settings/schedules' },
    { name: t('new_schedule'), href: '/settings/schedules/create' },
  ];

  const { data: blankSchedule } = useBlankScheduleQuery();

  const [schedule, setSchedule] = useState<Schedule>();
  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({ setErrors, setSchedule, schedule });

  useEffect(() => {
    if (blankSchedule) {
      setSchedule({
        ...blankSchedule,
        template: 'email_statement',
        frequency_id: Frequency.Monthly,
        parameters: {
          clients: [],
          date_range: 'last7_days',
          show_aging_table: false,
          show_payments_table: false,
          status: 'all',
        },
      });
    }
  }, [blankSchedule]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);
      setErrors(undefined);
      toast.processing();

      request('POST', endpoint('/api/v1/task_schedulers'), schedule)
        .then((response: GenericSingleResourceResponse<Schedule>) => {
          toast.success('created_schedule');

          queryClient.invalidateQueries('/api/v1/task_schedulers');

          navigate(
            route('/settings/schedules/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={isFormBusy || !schedule || showPlanAlert}
      onSaveClick={handleSave}
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      {schedule ? (
        <ScheduleForm
          schedule={schedule}
          handleChange={handleChange}
          errors={errors}
        />
      ) : (
        <Spinner />
      )}
    </Settings>
  );
}
