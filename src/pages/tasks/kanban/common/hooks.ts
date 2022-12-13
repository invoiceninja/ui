/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Task } from 'common/interfaces/task';
import { useSetAtom } from 'jotai';
import { useQuery } from 'react-query';
import { currentTaskAtom, isKanbanSliderVisibleAtom } from './atoms';

export function useHandleCurrentTask(id: string | undefined) {
  const setCurrentTask = useSetAtom(currentTaskAtom);
  const setIsKanbanSliderVisible = useSetAtom(isKanbanSliderVisibleAtom);

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
