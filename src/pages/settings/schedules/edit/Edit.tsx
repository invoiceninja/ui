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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useShouldDisableAdvanceSettings } from 'common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from 'common/hooks/useTitle';
import { Schedule } from 'common/interfaces/schedule';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useScheduleQuery } from 'common/queries/schedules';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ScheduleForm } from '../common/components/ScheduleForm';
import { useHandleChange } from '../common/hooks/useHandleChange';

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

  useEffect(() => {
    if (scheduleResponse) {
      setSchedule(scheduleResponse);
    }
  }, [scheduleResponse]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);
      setErrors(undefined);
      toast.processing();

      request('PUT', endpoint('/api/v1/task_schedulers/:id', { id }), schedule)
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
