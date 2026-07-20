import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  ReminderSchedule,
  Template,
} from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card } from '$app/components/cards';
import { Button, InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

export default function ReminderSchedules() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [isFormBusy, setIsFormBusy] = useState(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<ReminderSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_id: '',
    trigger_event: 'after_send',
    num_days: 1,
    schedule_direction: 'after_event',
    enabled: true,
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['/api/reminder_schedules/docuninja'],
    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/reminder_schedules'),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then((res) => res.data.data),
    staleTime: Infinity,
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/templates/docuninja'],
    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/templates'),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then((res) => res.data.data),
    staleTime: Infinity,
  });

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      template_id: templates?.[0]?.id || '',
      trigger_event: 'after_send',
      num_days: 1,
      schedule_direction: 'after_event',
      enabled: true,
    });
    setErrors(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!editingSchedule && templates?.length && !formData.template_id) {
      setFormData((prev) => ({ ...prev, template_id: templates[0].id }));
    }
  }, [templates, editingSchedule]);

  const openEditModal = (schedule: ReminderSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      template_id: schedule.template_id,
      trigger_event: schedule.trigger_event,
      num_days: schedule.num_days,
      schedule_direction: schedule.schedule_direction,
      enabled: schedule.enabled,
    });
    setErrors(null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (isFormBusy) {
      return;
    }

    setIsFormBusy(true);

    if (!editingSchedule) {
      toast.processing();
    }

    const isEdit = !!editingSchedule;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? docuNinjaEndpoint(`/api/reminder_schedules/${editingSchedule.id}`)
      : docuNinjaEndpoint('/api/reminder_schedules');

    const payload = {
      name: formData.name,
      template_id: formData.template_id,
      trigger_event: formData.trigger_event,
      num_days: Number(formData.num_days),
      schedule_direction: formData.schedule_direction,
      enabled: formData.enabled,
    };

    request(method, url, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          'X-DOCU-NINJA-TOKEN'
        )}`,
      },
    })
      .then(() => {
        toast.success(
          isEdit ? 'updated_reminder_schedule' : 'created_reminder_schedule'
        );

        $refetch(['docuninja_reminder_schedules']);
        setIsModalOpen(false);
        setErrors(null);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.error(
            error.response.data.message || 'validation_errors'
          );
        } else {
          toast.error('error_title');
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  const handleDelete = (schedule: ReminderSchedule) => {
    if (isFormBusy) {
      return;
    }

    setIsFormBusy(true);
    toast.processing();

    request(
      'DELETE',
      docuNinjaEndpoint(`/api/reminder_schedules/${schedule.id}`),
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            'X-DOCU-NINJA-TOKEN'
          )}`,
        },
      }
    )
      .then(() => {
        toast.success('deleted_reminder_schedule');

        $refetch(['docuninja_reminder_schedules']);
      })
      .catch(() => toast.error('error_title'))
      .finally(() => setIsFormBusy(false));
  };

  const handleToggleEnabled = (schedule: ReminderSchedule) => {
    request(
      'PUT',
      docuNinjaEndpoint(`/api/reminder_schedules/${schedule.id}`),
      { enabled: !schedule.enabled },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            'X-DOCU-NINJA-TOKEN'
          )}`,
        },
      }
    )
      .then(() => {
        $refetch(['docuninja_reminder_schedules']);
      })
      .catch(() => toast.error('error_title'));
  };

  return (
    <>
      {errors && <ValidationAlert errors={errors} />}

      <Card
        title={t('reminder_schedules')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        topRight={
          <Button type="primary" behavior="button" onClick={openAddModal}>
            {t('add_reminder_schedule')}
          </Button>
        }
      >
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        )}

        {!isLoading && (!schedules || schedules.length === 0) && (
          <div className="flex justify-center items-center py-2 px-4 sm:px-6 font-medium">
            {t('no_reminder_schedules_found')}.
          </div>
        )}

        {!isLoading && schedules && schedules.length > 0 && (
          <div className="divide-y" style={{ borderColor: colors.$20 }}>
            {schedules.map((schedule: ReminderSchedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between px-4 sm:px-6 py-4"
              >
                <div className="flex items-center space-x-4">
                  <Toggle
                    checked={schedule.enabled}
                    onChange={() => handleToggleEnabled(schedule)}
                  />

                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.$3 }}
                    >
                      {schedule.name}
                    </p>

                    <p className="text-xs" style={{ color: colors.$5 }}>
                      {schedule.template?.name || t('no_template')} &mdash;{' '}
                      {schedule.num_days} {t('days')}{' '}
                      {t(schedule.schedule_direction)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    type="secondary"
                    behavior="button"
                    onClick={() => openEditModal(schedule)}
                  >
                    {t('edit')}
                  </Button>

                  <Button
                    type="secondary"
                    behavior="button"
                    onClick={() => handleDelete(schedule)}
                  >
                    {t('delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title={
          editingSchedule
            ? t('edit_reminder_schedule')
            : t('add_reminder_schedule')
        }
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <InputField
            label={t('name')}
            value={formData.name}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, name: value }))
            }
            disabled={isFormBusy}
          />

          <SelectField
            label={t('template')}
            value={formData.template_id}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, template_id: value }))
            }
            disabled={isFormBusy}
          >
            {templates?.map((template: Template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={t('trigger_event')}
            value={formData.trigger_event}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, trigger_event: value }))
            }
            disabled={isFormBusy}
          >
            <option value="after_send">{t('after_send')}</option>
          </SelectField>

          <InputField
            label={t('num_days')}
            type="number"
            value={String(formData.num_days)}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                num_days: parseInt(value) || 0,
              }))
            }
            disabled={isFormBusy}
          />

          <Toggle
            label={t('enabled')}
            checked={formData.enabled}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, enabled: value }))
            }
            disabled={isFormBusy}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="secondary"
              behavior="button"
              onClick={() => setIsModalOpen(false)}
            >
              {t('cancel')}
            </Button>

            <Button
              type="primary"
              behavior="button"
              onClick={handleSave}
              disabled={isFormBusy}
            >
              {editingSchedule ? t('save') : t('add')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
