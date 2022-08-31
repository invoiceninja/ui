/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClickableElement } from '@invoiceninja/cards';
import { date, trans } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { ActivityRecord } from 'common/interfaces/activity-record';
import { generatePath } from 'react-router-dom';
import { resolveActivityResource } from '../helprs/resolve-activity-resource';

export function useGenerateActivityElement() {
  const { dateFormat } = useCurrentCompanyDateFormats();

  return (activity: ActivityRecord) => {
    const resource = resolveActivityResource(activity);

    return (
      <ClickableElement
        to={generatePath(`/${resource}s/:id/edit`, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          id: activity[resource]?.hashed_id ?? '',
        })}
      >
        {trans(`activity_${activity.activity_type_id}`, {
          client: activity?.client?.name,
          contact: `${activity?.contact?.first_name} ${activity?.contact?.last_name}`,
          quote: activity?.quote?.number,
          user: activity?.user
            ? `${activity?.user?.first_name} ${activity?.user?.last_name}`
            : 'System',
          expense: activity?.expense?.number,
          invoice: activity?.invoice?.number,
          recurring_invoice: activity?.recurring_invoice?.number,
          payment: activity?.payment?.number,
          credit: activity?.credit?.number,
          task: activity?.task?.number,
          vendor: activity?.vendor?.name,
        })}

        <p className="text-gray-500 text-xs">
          {date(activity.created_at, dateFormat)} &#183; {activity.ip}
        </p>
      </ClickableElement>
    );
  };
}
