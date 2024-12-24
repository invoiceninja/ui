/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { classNames, endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import { useGenerateActivityElement } from '../hooks/useGenerateActivityElement';
import React, { ReactNode } from 'react';

interface Props {
  isEditMode?: boolean;
  topRight?: ReactNode;
}

export function Activity({ topRight, isEditMode }: Props) {
  const [t] = useTranslation();

  const { data, isLoading, isError } = useQuery(
    ['/api/v1/activities'],
    () => request('GET', endpoint('/api/v1/activities?reactv2')),
    { staleTime: 300000 }
  );

  const activityElement = useGenerateActivityElement();

  return (
    <Card
      title={t('recent_activity')}
      className={classNames('relative drag-handle', {
        'cursor-grab': isEditMode,
      })}
      height="full"
      withoutBodyPadding
      topRight={topRight}
      renderFromShadcn
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
        className={classNames('pl-6 pr-4 overflow-y-auto drag-handle', {
          'cursor-grab': isEditMode,
        })}
        style={{ height: `calc(100% - ${!isEditMode ? '3.7rem' : '4.9rem'}` }}
      >
        <div className="flex flex-col pr-4">
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
