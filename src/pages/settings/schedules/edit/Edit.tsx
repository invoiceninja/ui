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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useScheduleQuery } from '$app/common/queries/schedules';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ScheduleForm } from '../common/components/ScheduleForm';
import { useHandleChange } from '../common/hooks/useHandleChange';
import { useFormatSchedulePayload } from '$app/pages/settings/schedules/common/hooks/useFormatSchedulePayload';

export function Edit() {
  const { documentTitle } = useTitle('edit_schedule');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('schedules'), href: '/settings/schedules' },
    { name: t('edit_schedule'), href: route('/settings/schedules/:id/edit') },
  ];

  const { data: scheduleResponse } = useScheduleQuery({ id });

  const [schedule, setSchedule] = useState<Schedule>();
  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({ setErrors, setSchedule, schedule });

  const formatSchedulePayload = useFormatSchedulePayload();

  useEffect(() => {
    if (scheduleResponse) {
      setSchedule(scheduleResponse);
    }
  }, [scheduleResponse]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy && schedule) {
      setIsFormBusy(true);
      setErrors(undefined);
      toast.processing();

      const formattedSchedule = formatSchedulePayload(schedule);

      request(
        'PUT',
        endpoint('/api/v1/task_schedulers/:id', { id }),
        formattedSchedule
      )
        .then(() => {
          toast.success('updated_schedule');

          queryClient.invalidateQueries('/api/v1/task_schedulers');

          queryClient.invalidateQueries(
            route('/api/v1/task_schedulers/:id', { id })
          );

          navigate('/settings/schedules');
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
          page="edit"
        />
      ) : (
        <Spinner />
      )}
    </Settings>
  );
}
