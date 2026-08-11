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
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { QuoteActivity } from '$app/common/interfaces/quote-activity';
import { Card } from '$app/components/cards';
import { SquareActivityChart } from '$app/components/icons/SquareActivityChart';
import { Spinner } from '$app/components/Spinner';
import { useGenerateActivityElement } from '../../common/components/QuoteSlider';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export default function Activities() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const activityElement = useGenerateActivityElement();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/v1/activities/entity', id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'quote',
        entity_id: id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<QuoteActivity>>) =>
          response.data.data
      ),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

  return (
    <Card
      title={t('activity')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      <div
        className={classNames('w-full px-2 pt-2', {
          'pb-10': activities && activities.length,
          'pb-6': !activities || !activities.length,
        })}
      >
        {isLoading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        {activities && !activities.length && (
          <div className="px-3 pt-3 text-sm">{t('api_404')}</div>
        )}

        {activities?.map((activity) => (
          <Box
            key={activity.id}
            className="flex space-x-3 p-4 rounded-md flex-1 min-w-0"
            theme={{
              backgroundColor: colors.$1,
              hoverBackgroundColor: colors.$25,
            }}
          >
            <div className="flex items-center justify-center">
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: colors.$20 }}
              >
                <SquareActivityChart
                  size="1.3rem"
                  color={colors.$16}
                  filledColor={colors.$16}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
              <div className="text-sm" style={{ color: colors.$3 }}>
                {activityElement(activity)}
              </div>

              <div
                className="flex w-full items-center space-x-1 text-xs truncate"
                style={{ color: colors.$17 }}
              >
                <span className="whitespace-nowrap">
                  {date(activity.created_at, `${dateFormat} ${timeFormat}`)}
                </span>

                <span>-</span>

                <span>{activity.ip}</span>
              </div>
            </div>
          </Box>
        ))}
      </div>
    </Card>
  );
}
