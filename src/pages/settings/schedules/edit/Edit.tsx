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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ScheduleForm } from '../common/components/ScheduleForm';
import { useHandleChange } from '../common/hooks/useHandleChange';
import { useFormatSchedulePayload } from '$app/pages/settings/schedules/common/hooks/useFormatSchedulePayload';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useActions } from '../common/hooks/useActions';
import { ResourceActions } from '$app/components/ResourceActions';

export function Edit() {
  const { documentTitle } = useTitle('edit_schedule');

  const [t] = useTranslation();
  const { id } = useParams();

  const actions = useActions();
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

  const formatSchedulePayload = useFormatSchedulePayload({ schedule });

  const handleSave = () => {
    if (!isFormBusy && schedule) {
      setIsFormBusy(true);
      setErrors(undefined);
      toast.processing();

      request(
        'PUT',
        endpoint('/api/v1/task_schedulers/:id', { id }),
        formatSchedulePayload()
      )
        .then(() => {
          toast.success('updated_schedule');

          $refetch(['task_schedulers']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (scheduleResponse) {
      setSchedule(scheduleResponse);
    }
  }, [scheduleResponse]);

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        schedule && (
          <ResourceActions
            resource={schedule}
            onSaveClick={handleSave}
            actions={actions}
            disableSaveButton={isFormBusy || !schedule || showPlanAlert}
          />
        )
      }
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
