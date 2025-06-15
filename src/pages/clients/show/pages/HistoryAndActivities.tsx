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
import { useColorScheme } from '$app/common/colors';
import { EmailRecord } from '$app/components/EmailRecord';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { Spinner } from '$app/components/Spinner';

export default function HistoryAndActivities() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const activityElement = useGenerateActivityElement();

  const context: Context = useOutletContext();
  const { displayName } = context;

  const [commentsOnly, setCommentsOnly] = useState<boolean>(false);

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
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

  const { data: emailRecords, isLoading: isLoadingEmailRecords } = useQuery<
    EmailRecordType[]
  >({
    queryKey: ['/api/v1/clients', id, 'emailHistory'],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/emails/clientHistory/:id', { id })
      ).then((response) => response.data),
    enabled: id !== null,
    staleTime: Infinity,
  });

  return (
    <div className="flex flex-col xl:flex-row gap-4 w-full">
      <Card
        title={t('email_history')}
        className="h-full relative shadow-sm w-full xl:w-1/2"
        headerClassName="px-4 sm:px-6 py-[1.7rem]"
        withoutBodyPadding
        style={{ borderColor: colors.$24 }}
        withoutHeaderPadding
        headerStyle={{ borderColor: colors.$20 }}
      >
        <div className="px-4 sm:px-6 pb-6 pt-4">
          {isLoadingEmailRecords && <Spinner />}

          <div className="flex flex-col overflow-y-auto max-h-96 space-y-4">
            {emailRecords?.map(
              (emailRecord, index) =>
                emailRecord && (
                  <EmailRecord
                    key={index}
                    emailRecord={emailRecord}
                    index={index}
                    withAllBorders
                    withEntityNavigationIcon
                  />
                )
            )}
          </div>
        </div>
      </Card>

      <Card
        title={t('recent_activity')}
        className="h-full relative shadow-sm w-full xl:w-1/2"
        topRight={
          <div className="flex flex-col space-x-0 space-y-3 sm:space-y-0 sm:space-x-10 sm:flex-row items-end sm:items-center">
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
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <div className="px-4 sm:px-6 pb-6 pt-4">
          {isLoadingActivities && <Spinner />}

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
        </div>
      </Card>
    </div>
  );
}
