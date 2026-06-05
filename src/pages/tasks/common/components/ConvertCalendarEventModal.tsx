/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  CalendarEvent,
  calendarEventDateKey,
  calendarEventKey,
} from '$app/common/interfaces/calendar-event';
import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankTaskQuery } from '$app/common/queries/tasks';
import { Modal } from '$app/components/Modal';
import { TaskDetails } from './TaskDetails';
import { TaskTable } from './TaskTable';
import { isOverlapping } from '../helpers/is-overlapping';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  event: CalendarEvent | null;
  alreadyLinked: boolean;
}

const buildTimeLog = (event: CalendarEvent): string => {
  // All-day events carry no clock times. Anchor a 1h placeholder at 09:00
  // local on the event date so the task at least records the day it happened.
  // The user can edit it after conversion.
  //
  // Derive the date from calendarEventDateKey() — the same wall-clock
  // YYYY-MM-DD used for the task's `date` field below. Parsing the raw
  // provider string (e.g. Microsoft's midnight-UTC "...T00:00:00Z") through
  // dayjs() would shift it into the browser timezone first, rolling the day
  // backwards for users west of UTC and anchoring the task on the wrong date.
  if (event.all_day) {
    const anchor = dayjs(calendarEventDateKey(event)).startOf('day').hour(9);
    return JSON.stringify([
      [anchor.unix(), anchor.add(1, 'hour').unix(), '', true],
    ]);
  }

  const start = dayjs(event.start).unix();
  const end = dayjs(event.end).unix();

  // Provider returned the same instant for start and end (or a degenerate
  // ordering), so pad to a 1h block from the start instead of saving a zero-
  // length log entry that downstream views will treat as empty.
  if (!end || end <= start) {
    return JSON.stringify([[start, start + 3600, '', true]]);
  }

  return JSON.stringify([[start, end, '', true]]);
};

const buildDescription = (event: CalendarEvent): string => {
  if (event.description) {
    return `${event.title}\n\n${event.description}`;
  }
  return event.title;
};

export function ConvertCalendarEventModal(props: Props) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const { data: blank } = useBlankTaskQuery();

  const [task, setTask] = useState<Task>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState(false);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  useEffect(() => {
    if (!props.event || !blank) {
      setTask(undefined);
      return;
    }

    setErrors(undefined);

    setTask({
      ...blank,
      description: buildDescription(props.event),
      time_log: buildTimeLog(props.event),
      date: calendarEventDateKey(props.event),
      meta: {
        // Backend uses this triple to dedupe: same calendar event can only
        // be converted to one task.
        calendar_event_id:
          props.event.provider_event_id || calendarEventKey(props.event),
        calendar_id: props.event.calendar_id,
        calendar_provider: props.event.provider,
      },
    });
  }, [props.event, blank]);

  const handleSave = (e: FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!task || isFormBusy || props.alreadyLinked) return;

    if (isOverlapping(task)) {
      toast.error('task_errors');
      return;
    }

    setIsFormBusy(true);
    toast.processing();

    request('POST', endpoint('/api/v1/tasks'), task)
      .then(() => {
        toast.success('created_task');
        $refetch(['tasks']);
        queryClient.invalidateQueries(['calendar_events']);
        props.setVisible(false);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
          // Surface the existing task if the backend rejected the dedup race.
          $refetch(['tasks']);
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  return (
    <Modal
      title={t('convert_to_task')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
      size="large"
    >
      {props.alreadyLinked && (
        <div className="text-sm text-red-500">{t('already_linked')}</div>
      )}

      {task && (
        <TaskDetails
          task={task}
          handleChange={handleChange}
          errors={errors}
          taskModal={true}
        />
      )}
      {task && <TaskTable task={task} handleChange={handleChange} />}

      <Button
        className="self-end"
        onClick={handleSave}
        disabled={!task || isFormBusy || props.alreadyLinked}
        disableWithoutIcon
      >
        {t('save')}
      </Button>
    </Modal>
  );
}
