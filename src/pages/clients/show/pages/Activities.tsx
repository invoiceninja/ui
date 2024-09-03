/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useOutletContext, useParams } from 'react-router-dom';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import React, { useState } from 'react';
import {
  AddActivityComment,
  useGenerateActivityElement,
} from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { AxiosResponse } from 'axios';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Context } from './Documents';
import Toggle from '$app/components/forms/Toggle';

export default function Activities() {
  const { id } = useParams();

  const [t] = useTranslation();
  const activityElement = useGenerateActivityElement();

  const context: Context = useOutletContext();
  const { displayName } = context;

  const [commentsOnly, setCommentsOnly] = useState<boolean>(false);

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

  return (
    <Card
      title={t('recent_activity')}
      className="h-full relative"
      topRight={
        <div className="flex items-center space-x-10">
          <Toggle
            label={t('comments_only')}
            checked={commentsOnly}
            onValueChange={(value) => setCommentsOnly(value)}
          />

          <AddActivityComment
            entity="client"
            entityId={id}
            label={displayName}
          />
        </div>
      }
      withoutBodyPadding
    >
      <div className="pl-6 pr-4">
        <div className="flex flex-col overflow-y-auto pr-4">
          {activities
            ?.filter(
              (activity) =>
                (commentsOnly && activity.activity_type_id === 141) ||
                !commentsOnly
            )
            .map((record: ActivityRecord, index: number) => (
              <React.Fragment key={index}>
                {activityElement(record)}
              </React.Fragment>
            ))}
        </div>
      </div>
    </Card>
  );
}
