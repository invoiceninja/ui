/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useParams } from 'react-router-dom';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import React from 'react';
import { useGenerateActivityElement } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { AxiosResponse } from 'axios';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { InfoCard } from '$app/components/InfoCard';

export default function Activities() {
  const { id } = useParams();

  const [t] = useTranslation();

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities/entity', id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'client',
        entity_id: id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<ActivityRecord>>) =>
          response.data.data
      ),
    enabled: id !== null,
    staleTime: Infinity,
  });

  const activityElement = useGenerateActivityElement();

  return (
    <div className="col-span-12 lg:col-span-3">
      <InfoCard
        title={t('recent_activity')}
        value={
          <div className="flex flex-col max-h-56 overflow-y-auto pr-4">
            {activities &&
              activities.map((record: ActivityRecord, index: number) => (
                <div key={index} className="whitespace-normal">
                  {activityElement(record)}
                </div>
              ))}
          </div>
        }
        className="h-full"
      />
    </div>
  );
}
