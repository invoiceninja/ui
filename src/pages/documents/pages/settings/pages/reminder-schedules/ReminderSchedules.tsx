import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ReminderSchedule } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { Textarea } from '$app/components/forms/Textarea';
import Toggle from '$app/components/forms/Toggle';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { AxiosError } from 'axios';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

export default function ReminderSchedules() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [isFormBusy, setIsFormBusy] = useState(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<ReminderSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] =
    useState<ReminderSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
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

  const activeSchedules =
    schedules?.filter(
      (schedule: ReminderSchedule) =>
        !schedule.is_deleted && !schedule.archived_at
    ) ?? [];

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      num_days: 1,
      schedule_direction: 'after_event',
      enabled: true,
    });
    setErrors(null);
    setIsModalOpen(true);
  };

  const openEditModal = (schedule: ReminderSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      subject: schedule.subject,
      body: schedule.body,
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
    setErrors(null);

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
      subject: formData.subject,
      body: formData.body,
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
          toast.dismiss();
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
        setScheduleToDelete(null);
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
        toast.success('updated_reminder_schedule');

        $refetch(['docuninja_reminder_schedules']);
      })
      .catch(() => toast.error('error_title'));
  };

  return (
    <>
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

        {!isLoading && activeSchedules.length === 0 && (
          <div className="flex justify-center items-center py-2 px-4 sm:px-6 font-medium">
            {t('no_reminder_schedules_found')}.
          </div>
        )}

        {!isLoading && activeSchedules.length > 0 && (
          <div className="divide-y" style={{ borderColor: colors.$20 }}>
            {activeSchedules.map((schedule: ReminderSchedule) => (
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

                    <p className="text-xs" style={{ color: colors.$17 }}>
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
                    <MdEdit className="mr-2 h-4 w-4" />
                    {t('edit')}
                  </Button>

                  <Button
                    type="secondary"
                    behavior="button"
                    onClick={() => setScheduleToDelete(schedule)}
                  >
                    <MdDelete className="mr-2 h-4 w-4" />
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
        onClose={() => {
          setIsModalOpen(false);
          setErrors(null);
        }}
      >
        {errors && <ValidationAlert errors={errors} />}

        <div className="space-y-4">
          <InputField
            label={t('name')}
            value={formData.name}
            errorMessage={errors?.errors.name}
            onValueChange={(value) => {
              setErrors(null);
              setFormData((prev) => ({ ...prev, name: value }));
            }}
            disabled={isFormBusy}
          />

          <InputField
            label={t('subject')}
            value={formData.subject}
            errorMessage={errors?.errors.subject}
            onValueChange={(value) => {
              setErrors(null);
              setFormData((prev) => ({ ...prev, subject: value }));
            }}
            disabled={isFormBusy}
          />

          <Textarea
            id="body"
            label={t('body')}
            value={formData.body}
            errorMessage={errors?.errors.body}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setErrors(null);
              setFormData((prev) => ({ ...prev, body: e.target.value }));
            }}
            disabled={isFormBusy}
          />

          <InputField
            label={t('num_days')}
            type="number"
            value={String(formData.num_days)}
            errorMessage={errors?.errors.num_days}
            onValueChange={(value) => {
              setErrors(null);
              setFormData((prev) => ({
                ...prev,
                num_days: parseInt(value) || 0,
              }));
            }}
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

      <Modal
        title={t('are_you_sure')}
        visible={Boolean(scheduleToDelete)}
        onClose={() => setScheduleToDelete(null)}
        disableClosing={isFormBusy}
      >
        <span className="font-medium">
          {t('delete_reminder_schedule_confirmation')}
        </span>

        <Button
          behavior="button"
          onClick={() => scheduleToDelete && handleDelete(scheduleToDelete)}
          disabled={isFormBusy}
        >
          {t('continue')}
        </Button>
      </Modal>
    </>
  );
}
