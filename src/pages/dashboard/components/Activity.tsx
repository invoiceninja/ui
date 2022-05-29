/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { Spinner } from 'components/Spinner';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import { ActivityRecord } from 'common/interfaces/activity-record';
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
    <Card title={t('activity')} className="h-96" withScrollableBody>
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
