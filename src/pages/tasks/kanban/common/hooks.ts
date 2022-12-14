/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Task } from 'common/interfaces/task';
import { useSetAtom } from 'jotai';
import { parseTimeLog } from 'pages/tasks/common/helpers/calculate-time';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { currentTaskAtom, isKanbanViewSliderVisibleAtom } from './atoms';

export function useHandleCurrentTask(id: string | undefined) {
  const setCurrentTask = useSetAtom(currentTaskAtom);
  const setIsKanbanSliderVisible = useSetAtom(isKanbanViewSliderVisibleAtom);

  useQuery(
    route('/api/v1/tasks/:id', { id }),
    () =>
      request('GET', endpoint('/api/v1/tasks/:id', { id }))
        .then((response: GenericSingleResourceResponse<Task>) => {
          setCurrentTask(response.data.data);
          setIsKanbanSliderVisible(true);
        })
        .catch(() => toast.error()),
    { enabled: Boolean(id) }
  );
}

export function useFormatTimeLog() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const { t } = useTranslation();

  return (log: string) => {
    const logs: string[][] = [];

    parseTimeLog(log).map(([start, end]) => {
      logs.push([
        date(start, dateFormat),
        new Date(start * 1000).toLocaleTimeString(),
        end === 0 ? t('now') : new Date(end * 1000).toLocaleTimeString(),
      ]);
    });

    return logs;
  };
}
