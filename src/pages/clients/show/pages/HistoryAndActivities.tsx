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
import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import React, { useEffect, useState } from 'react';
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
import { InputField } from '$app/components/forms';
import { Search as SearchIcon } from '$app/components/icons/Search';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';

export default function HistoryAndActivities() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const activityElement = useGenerateActivityElement();

  const context: Context = useOutletContext();
  const { displayName } = context;

  const [filter, setFilter] = useState<string>('');
  const [commentsOnly, setCommentsOnly] = useState<boolean>(false);
  const [filteredEmailRecords, setFilteredEmailRecords] = useState<
    EmailRecordType[]
  >([]);

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

  const checkEmailRecord = (emailRecord: EmailRecordType) => {
    const doesSubjectContains = emailRecord.subject
      .toLowerCase()
      .includes(filter.toLowerCase());

    const doesRecipientsContains = emailRecord.recipients
      .toLowerCase()
      .includes(filter.toLowerCase());

    const doesEntityContains = emailRecord.entity
      .toLowerCase()
      .includes(filter.toLowerCase());

    const doesEventDateContains = emailRecord.events.some((event) => {
      const formattedDate = date(event.date, dateFormat);

      return formattedDate.includes(filter);
    });

    return (
      doesSubjectContains ||
      doesRecipientsContains ||
      doesEntityContains ||
      doesEventDateContains
    );
  };

  useEffect(() => {
    if (emailRecords) {
      setFilteredEmailRecords(emailRecords);
    }
  }, [emailRecords]);

  useEffect(() => {
    if (emailRecords) {
      if (filter) {
        setFilteredEmailRecords(
          emailRecords.filter((emailRecord) => checkEmailRecord(emailRecord))
        );
      } else {
        setFilteredEmailRecords(emailRecords || []);
      }
    }
  }, [filter]);

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
          {isLoadingEmailRecords && (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          )}

          {!isLoadingEmailRecords && (
            <>
              <div className="flex items-center space-x-1.5 py-2 px-4 flex-1 border-b mb-4">
                <SearchIcon color={colors.$5} size="1.6rem" />

                <div className="flex-1">
                  <InputField
                    className="border-transparent focus:border-transparent focus:ring-0 border-0 w-full px-0"
                    value={filter}
                    onValueChange={(value) => setFilter(value)}
                    placeholder={t('search_emails')}
                    changeOverride
                    style={{ backgroundColor: colors.$1, color: colors.$3 }}
                  />
                </div>
              </div>

              <div className="flex flex-col overflow-y-auto max-h-96 space-y-4">
                {filteredEmailRecords?.map(
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

                {filteredEmailRecords.length === 0 && (
                  <div className="text-center text-sm font-medium pt-6 pb-4">
                    {t('no_records_found')}.
                  </div>
                )}
              </div>
            </>
          )}
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
