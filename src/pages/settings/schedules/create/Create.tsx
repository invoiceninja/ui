/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Frequency } from '$app/common/enums/frequency';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Parameters, Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankScheduleQuery } from '$app/common/queries/schedules';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import { useFormatSchedulePayload } from '$app/pages/settings/schedules/common/hooks/useFormatSchedulePayload';
import { AxiosError } from 'axios';
import { useAtom } from 'jotai';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { scheduleParametersAtom } from '../common/components/EmailStatement';
import { ScheduleForm } from '../common/components/ScheduleForm';
import { useHandleChange } from '../common/hooks/useHandleChange';

export const blankScheduleParameters: Parameters = {
  clients: [],
  date_range: 'last7_days',
  show_aging_table: false,
  show_credits_table: false,
  show_payments_table: false,
  status: 'all',
  entity: 'invoice',
  entity_id: '',
  report_name: 'activity',
};

export function Create() {
  const { documentTitle } = useTitle('new_schedule');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('schedules'), href: '/settings/schedules' },
    { name: t('new_schedule'), href: '/settings/schedules/create' },
  ];

  const { data: blankSchedule } = useBlankScheduleQuery();

  const [schedule, setSchedule] = useState<Schedule>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [parametersAtom, setParametersAtom] = useAtom(scheduleParametersAtom);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({ setErrors, setSchedule, schedule });

  const formatSchedulePayload = useFormatSchedulePayload();

  useEffect(() => {
    if (blankSchedule) {
      setSchedule(() => {
        let currentParameters = parametersAtom;

        if (!searchParams.get('template')) {
          currentParameters = undefined;
          setParametersAtom(undefined);
        }

        return {
          ...blankSchedule,
          template: searchParams.get('template') || 'email_statement',
          frequency_id: Frequency.Monthly,
          remaining_cycles: -1,
          parameters: currentParameters || blankScheduleParameters,
        };
      });
    }
  }, [blankSchedule]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy && schedule) {
      setIsFormBusy(true);
      setErrors(undefined);
      toast.processing();

      const formattedSchedule = formatSchedulePayload(schedule);

      request('POST', endpoint('/api/v1/task_schedulers'), formattedSchedule)
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
