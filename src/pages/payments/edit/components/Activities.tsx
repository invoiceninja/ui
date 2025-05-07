/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Card } from '$app/components/cards';
import { Spinner } from '$app/components/Spinner';
import { useGenerateActivityElement } from '$app/pages/payments/common/hooks/useGenerateActivityElement';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { PaymentActivity } from '$app/common/interfaces/payment-activity';
import { usePaymentQuery } from '$app/common/queries/payments';
import { SquareActivityChart } from '$app/components/icons/SquareActivityChart';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';
import classNames from 'classnames';

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
  const { data: payment } = usePaymentQuery({ id });
  const { dateFormat } = useCurrentCompanyDateFormats();

  const activityElement = useGenerateActivityElement();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/v1/activities/entity', id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'payment',
        entity_id: id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<PaymentActivity>>) =>
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

        {!isLoading && activities && !activities.length && (
          <div className="px-3 pt-3 text-sm">{t('api_404')}</div>
        )}

        <div className="flex flex-col w-full">
          {!isLoading &&
            payment &&
            activities &&
            activities.map((activity) => (
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
      </div>
    </Card>
  );
}
