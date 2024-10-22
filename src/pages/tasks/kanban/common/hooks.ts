/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from '$app/common/helpers';
import { useTaskQuery } from '$app/common/queries/tasks';
import { useSetAtom } from 'jotai';
import { parseTimeLog } from '$app/pages/tasks/common/helpers/calculate-time';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { currentTaskAtom, isKanbanViewSliderVisibleAtom } from './atoms';
import { useDateTime } from '$app/common/hooks/useDateTime';

export function useHandleCurrentTask(id: string | undefined) {
  const setCurrentTask = useSetAtom(currentTaskAtom);
  const setIsKanbanSliderVisible = useSetAtom(isKanbanViewSliderVisibleAtom);

  const { data } = useTaskQuery({ id, enabled: Boolean(id) });

  useEffect(() => {
    if (data) {
      setCurrentTask(data);
      setIsKanbanSliderVisible(true);
    }
  }, [data]);
}

export function useFormatTimeLog() {
  const { t } = useTranslation();

  const formatTime = useDateTime({ formatOnlyTime: true });

  return (log: string) => {
    const logs: string[][] = [];

    parseTimeLog(log).map(([start, end]) => {
      logs.push([
        date(start, 'YYYY-MM-DD'),
        formatTime(start),
        end === 0 ? t('now') : formatTime(end),
      ]);
    });

    return logs;
  };
}
