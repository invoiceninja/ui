/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Card } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import {
  AddActivityComment,
  useGenerateActivityElement,
} from '$app/pages/dashboard/hooks/useGenerateActivityElement';

interface Context {
  displayName: string;
}

export default function Activities() {
  const { id } = useParams();

  const [t] = useTranslation();

  const colors = useColorScheme();

  const activityElement = useGenerateActivityElement();

  const context: Context = useOutletContext();
  const { displayName } = context;

  const [commentsOnly, setCommentsOnly] = useState<boolean>(false);

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities/entity', id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'vendor',
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
      className="shadow-sm"
      topRight={
        <div className="flex items-center space-x-10">
          <Toggle
            label={t('comments_only')}
            checked={commentsOnly}
            onValueChange={(value) => setCommentsOnly(value)}
          />

          <AddActivityComment
            entity="vendor"
            entityId={id}
            label={displayName}
          />
        </div>
      }
      withoutBodyPadding
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div
        className={classNames('px-6 pt-2', {
          'pb-6': Boolean(
            activities?.filter(
              (activity) =>
                (commentsOnly && activity.activity_type_id === 141) ||
                !commentsOnly
            )?.length
          ),
          'pb-4': Boolean(
            !activities?.filter(
              (activity) =>
                (commentsOnly && activity.activity_type_id === 141) ||
                !commentsOnly
            )?.length
          ),
        })}
      >
        {Boolean(
          !activities?.filter(
            (activity) =>
              (commentsOnly && activity.activity_type_id === 141) ||
              !commentsOnly
          )?.length
        ) && (
          <div className="pt-2">
            <span className="text-sm font-medium">
              {t('no_records_found')}.
            </span>
          </div>
        )}

        {Boolean(activities?.length) && (
          <div className="flex flex-col overflow-y-auto max-h-96">
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
        )}
      </div>
    </Card>
  );
}
