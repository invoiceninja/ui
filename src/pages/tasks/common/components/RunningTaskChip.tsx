/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useTasksQuery } from '$app/common/queries/tasks';
import { Task } from '$app/common/interfaces/task';
import { isTaskRunning } from '$app/pages/tasks/common/helpers/calculate-entity-state';
import { TaskClock } from '$app/pages/tasks/kanban/components/TaskClock';
import { useStop } from '$app/pages/tasks/common/hooks/useStop';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { MediaPause } from '$app/components/icons/MediaPause';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { QuickLogTimeModal } from './QuickLogTimeModal';
import { Plus } from '$app/components/icons/Plus';

export function RunningTaskChip() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const hasPermission = useHasPermission();

  const stop = useStop();

  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const urlDate = searchParams.get('date') ?? undefined;

  const { data } = useTasksQuery({
    endpoint: '/api/v1/tasks?per_page=100&sort=updated_at|desc',
  });

  const running: Task | undefined = useMemo(
    () => data?.data?.find((task) => isTaskRunning(task)),
    [data]
  );

  if (!hasPermission('view_task') && !hasPermission('create_task')) {
    return null;
  }

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (running) stop(running);
  };

  const openTask = () => {
    if (running) navigate(`/tasks/${running.id}/edit`);
  };

  return (
    <>
      <QuickLogTimeModal
        visible={quickLogVisible}
        setVisible={setQuickLogVisible}
        defaults={urlDate ? { date: urlDate } : undefined}
      />

      {running ? (
        <button
          type="button"
          onClick={openTask}
          className="hidden sm:inline-flex items-center px-3 h-9 rounded-md border space-x-2 cursor-pointer"
          style={{
            borderColor: colors.$5,
            backgroundColor: colors.$1,
            color: colors.$3,
          }}
          title={running.description || t('running_task') || 'Running task'}
        >
          <span
            className="inline-block h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#ef4444' }}
          />
          <span className="text-xs max-w-[10rem] truncate hidden md:inline">
            {running.description || `#${running.number || ''}`}
          </span>
          <TaskClock task={running} extraSmallText />
          <span
            role="button"
            tabIndex={0}
            onClick={handleStop}
            className="ml-1 p-0.5 rounded hover:opacity-70"
            aria-label={t('stop') as string}
          >
            <MediaPause size="0.9rem" color={colors.$3} />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setQuickLogVisible(true)}
          className="hidden sm:inline-flex items-center px-3 h-9 rounded-md border space-x-2"
          style={{
            borderColor: colors.$5,
            backgroundColor: colors.$1,
            color: colors.$3,
          }}
          title={t('log_time') as string}
        >
          <Plus size="0.9rem" color={colors.$3} />
          <span className="text-xs hidden md:inline">{t('log_time')}</span>
        </button>
      )}
    </>
  );
}
