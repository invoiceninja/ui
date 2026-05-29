/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Button,
  Checkbox,
  InputField,
  InputLabel,
} from '$app/components/forms';
import { useColorScheme } from '$app/common/colors';
import { Modal } from '$app/components/Modal';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useBlankTaskQuery, useTasksQuery } from '$app/common/queries/tasks';
import { Task } from '$app/common/interfaces/task';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { parseDurationToSeconds } from '../helpers';

interface Defaults {
  clientId?: string;
  projectId?: string;
  date?: string;
  description?: string;
}

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  defaults?: Defaults;
  onCreated?: (task: Task) => void;
}

export function QuickLogTimeModal(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { data: blank } = useBlankTaskQuery();
  const { data: tasksResponse } = useTasksQuery({
    endpoint: '/api/v1/tasks?per_page=200&sort=updated_at|desc',
  });

  const [clientId, setClientId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [billable, setBillable] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const descriptionSuggestions = useMemo(() => {
    const list = tasksResponse?.data ?? [];
    const filtered = projectId
      ? list.filter((task) => task.project_id === projectId)
      : list;
    const set = new Set<string>();
    filtered.forEach((task) => {
      if (task.description) set.add(task.description);
    });
    return Array.from(set).slice(0, 25);
  }, [tasksResponse, projectId]);

  // Snapshot the primitive defaults so the effect doesn't re-fire when the
  // parent re-renders and passes a fresh `defaults` object reference.
  const defaultClientId = props.defaults?.clientId ?? '';
  const defaultProjectId = props.defaults?.projectId ?? '';
  const defaultDescription = props.defaults?.description ?? '';
  const defaultDate = props.defaults?.date ?? '';

  useEffect(() => {
    if (!props.visible) return;

    setClientId(defaultClientId);
    setProjectId(defaultProjectId);
    setDescription(defaultDescription);
    setDuration('');
    setDate(defaultDate || dayjs().format('YYYY-MM-DD'));
    setBillable(true);
  }, [
    props.visible,
    defaultClientId,
    defaultProjectId,
    defaultDescription,
    defaultDate,
  ]);

  const handleSave = () => {
    if (isBusy || !blank) return;

    const seconds = parseDurationToSeconds(duration);

    if (seconds === null || seconds <= 0) {
      toast.error('please_enter_a_valid_duration');
      return;
    }

    const startUnix = dayjs(`${date} 09:00:00`, 'YYYY-MM-DD HH:mm:ss').unix();
    const endUnix = startUnix + seconds;

    const payload: Task = {
      ...blank,
      client_id: clientId || '',
      project_id: projectId || '',
      description,
      is_date_based: true,
      time_log: JSON.stringify([[startUnix, endUnix, '', billable]]),
    };

    setIsBusy(true);
    toast.processing();

    request('POST', endpoint('/api/v1/tasks'), payload)
      .then((response) => {
        toast.success('created_task');
        $refetch(['tasks']);
        props.onCreated?.(response.data.data);
        props.setVisible(false);
      })
      .finally(() => setIsBusy(false));
  };

  return (
    <Modal
      title={t('log_time')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
      size="small"
    >
      <ClientSelector
        inputLabel={t('client')}
        value={clientId}
        onChange={(client) => {
          setClientId(client?.id ?? '');
          setProjectId('');
        }}
        onClearButtonClick={() => {
          setClientId('');
          setProjectId('');
        }}
        withoutAction
      />

      <ProjectSelector
        inputLabel={t('project')}
        value={projectId}
        clientId={clientId}
        onChange={(project) => {
          setProjectId(project?.id ?? '');
          if (project?.client_id) setClientId(project.client_id);
        }}
        onClearButtonClick={() => setProjectId('')}
        withoutAction
      />

      <InputField
        label={t('description')}
        value={description}
        onValueChange={setDescription}
        list="quick-log-description-suggestions"
      />
      <datalist id="quick-log-description-suggestions">
        {descriptionSuggestions.map((desc) => (
          <option key={desc} value={desc} />
        ))}
      </datalist>

      <InputField
        label={t('duration')}
        value={duration}
        onValueChange={setDuration}
        placeholder="1.5  or  1:30"
      />

      <div>
        <InputLabel>{t('date')}</InputLabel>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full py-2 px-3 rounded-md text-sm border focus:outline-none focus:ring-0"
          style={{
            backgroundColor: colors.$1,
            color: colors.$3,
            colorScheme: colors.$0,
            borderColor: colors.$5,
          }}
        />
      </div>

      <Checkbox
        label={t('billable')}
        checked={billable}
        onValueChange={(_, checked) => setBillable(Boolean(checked))}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isBusy} disableWithoutIcon>
          {t('save')}
        </Button>
      </div>
    </Modal>
  );
}
