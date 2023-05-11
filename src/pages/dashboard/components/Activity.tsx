/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import { useGenerateActivityElement } from '../hooks/useGenerateActivityElement';
import React, { useState } from 'react';
import { ViewAll } from './ViewAll';

export function Activity() {
  const [t] = useTranslation();

  const [viewedAll, setViewedAll] = useState<boolean>(false);

  const { data, isLoading, isError } = useQuery(
    '/api/v1/activities?react',
    () =>
      request(
        'GET',
        endpoint('/api/v1/activities?react&view_all=:viewedAll', {
          viewedAll,
        })
      )
  );

  const activityElement = useGenerateActivityElement();

  return (
    <Card
      title={t('recent_activity')}
      className="h-96 relative"
      withoutBodyPadding
    >
      {isLoading && (
        <NonClickableElement>
          <Spinner />
        </NonClickableElement>
      )}

      {isError && (
        <NonClickableElement>{t('error_refresh_page')}</NonClickableElement>
      )}

      <div
        className="flex flex-col overflow-y-auto"
        style={{ height: viewedAll ? '20rem' : '17rem' }}
      >
        {data?.data.data &&
          data.data.data.map((record: ActivityRecord, index: number) => (
            <React.Fragment key={index}>
              {activityElement(record)}
            </React.Fragment>
          ))}
      </div>

      <ViewAll viewedAll={viewedAll} setViewedAll={setViewedAll} />
    </Card>
  );
}
