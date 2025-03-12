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
import React from 'react';
import { useColorScheme } from '$app/common/colors';

export function Activity() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { data, isLoading, isError } = useQuery(
    ['/api/v1/activities'],
    () => request('GET', endpoint('/api/v1/activities?reactv2')),
    { staleTime: 300000 }
  );

  const activityElement = useGenerateActivityElement();

  return (
    <Card
      title={t('recent_activity')}
      className="h-96 relative shadow-sm"
      withoutBodyPadding
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      childrenClassName="px-0"
      style={{ borderColor: colors.$5 }}
      headerStyle={{ borderColor: colors.$5 }}
      withoutHeaderPadding
    >
      {isLoading && (
        <NonClickableElement>
          <Spinner />
        </NonClickableElement>
      )}

      {isError && (
        <NonClickableElement>{t('error_refresh_page')}</NonClickableElement>
      )}

      <div className="pt-4">
        <div
          className="flex flex-col overflow-y-auto px-4"
          style={{ height: '18.9rem' }}
        >
          {data?.data.data &&
            data.data.data.map((record: ActivityRecord, index: number) => (
              <React.Fragment key={index}>
                {activityElement(record)}
              </React.Fragment>
            ))}
        </div>
      </div>
    </Card>
  );
}
