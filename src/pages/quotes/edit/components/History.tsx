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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Card } from '$app/components/cards';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { DynamicLink } from '$app/components/DynamicLink';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import dayjs from 'dayjs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Spinner } from '$app/components/Spinner';
import { QuoteContext } from '../../create/Create';
import { Quote } from '$app/common/interfaces/quote';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { History as HistoryIcon } from '$app/components/icons/History';
import classNames from 'classnames';
import { route } from '$app/common/helpers/route';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

dayjs.extend(relativeTime);

export default function History() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const context: QuoteContext = useOutletContext();
  const { quote } = context;

  const navigate = useNavigate();
  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['/api/v1/quotes', id, 'payments'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/quotes/${id}?include=payments,activities.history&reminder_schedule=true`
        )
      ).then(
        (response: GenericSingleResourceResponse<Quote>) => response.data.data
      ),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

  return (
    <Card
      title={t('history')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      <div
        className={classNames('w-full px-2 pt-2', {
          'pb-10': resource?.activities?.length,
          'pb-6':
            resource?.activities &&
            resource?.activities.filter(({ history }) => history?.id).length ===
              0,
        })}
      >
        {isLoading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        <div>
          {resource?.activities &&
            resource.activities.filter(({ history }) => history?.id).length ===
              0 && <div className="px-3 pt-3 text-sm">{t('api_404')}</div>}

          {Boolean(resource?.activities?.length) && (
            <div className="flex flex-col w-full">
              {resource?.activities &&
                resource.activities.map((activity) => (
                  <Box
                    className="flex items-center justify-start p-4 space-x-3 rounded-md cursor-pointer"
                    key={activity.id}
                    onClick={() =>
                      navigate(
                        route('/activities/:id', {
                          id: activity.id,
                        })
                      )
                    }
                    theme={{
                      backgroundColor: colors.$1,
                      hoverBackgroundColor: colors.$25,
                    }}
                  >
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: colors.$20 }}
                    >
                      <HistoryIcon
                        size="1.3rem"
                        color={colors.$16}
                        filledColor={colors.$16}
                      />
                    </div>

                    <div className="flex flex-col items-start space-y-0.5 justify-center">
                      <div className="flex space-x-1 text-sm">
                        <span style={{ color: colors.$3 }}>
                          {quote?.client
                            ? formatMoney(
                                activity.history.amount,
                                quote?.client?.country_id,
                                quote?.client?.settings.currency_id
                              )
                            : null}
                        </span>

                        <div>
                          <ArrowRight color={colors.$17} size="1.1rem" />
                        </div>

                        <DynamicLink
                          to={`/clients/${activity.client_id}`}
                          renderSpan={disableNavigation(
                            'client',
                            quote?.client
                          )}
                        >
                          {quote?.client?.display_name}
                        </DynamicLink>
                      </div>

                      <div
                        className="flex items-center space-x-1 text-xs"
                        style={{ color: colors.$17 }}
                      >
                        <span>
                          {date(
                            activity.created_at,
                            `${dateFormat} ${timeFormat}`
                          )}
                        </span>

                        <span>{dayjs.unix(activity.created_at).fromNow()}</span>
                      </div>
                    </div>
                  </Box>
                ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
