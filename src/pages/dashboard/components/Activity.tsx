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

export function Activity() {
  const [t] = useTranslation();

  const { data, isLoading, isError } = useQuery(
    '/api/v1/activities?react',
    () => request('GET', endpoint('/api/v1/activities?react'))
  );

  const activityElement = useGenerateActivityElement();

  return (
    <Card
      title={t('activity')}
      className="h-96"
      padding="small"
      withScrollableBody
    >
      {isLoading && (
        <NonClickableElement>
          <Spinner />
        </NonClickableElement>
      )}

      {isError && (
        <NonClickableElement>{t('error_refresh_page')}</NonClickableElement>
      )}

      {data?.data.data &&
        data.data.data.map((record: ActivityRecord, index: number) => (
          <React.Fragment key={index}>{activityElement(record)}</React.Fragment>
        ))}
    </Card>
  );
}
