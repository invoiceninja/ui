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
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useTaskQuery } from '$app/common/queries/tasks';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

interface Props {
  taskId: string;
}
export function ViewLineItemTask(props: Props) {
  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const { taskId } = props;

  const { data: taskResponse } = useTaskQuery({ id: taskId });

  return (
    <>
      {taskResponse && (
        <div className="flex items-center space-x-1">
          {taskResponse.date && (
            <span className="text-sm">
              {date(taskResponse.date, dateFormat)} -
            </span>
          )}

          <span className="text-sm">
            {t('task')} {'=>'}
          </span>

          <Link to={route('/tasks/:id/edit', { id: taskId })}>
            # {taskResponse.number}
          </Link>
        </div>
      )}
    </>
  );
}
