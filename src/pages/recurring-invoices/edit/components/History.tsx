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
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card } from '$app/components/cards';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { DynamicLink } from '$app/components/DynamicLink';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import dayjs from 'dayjs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Spinner } from '$app/components/Spinner';
import { route } from '$app/common/helpers/route';
import { RecurringInvoiceContext } from '../../create/Create';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useColorScheme } from '$app/common/colors';
import { History as HistoryIcon } from '$app/components/icons/History';
import { ArrowRight } from 'react-feather';
import styled from 'styled-components';
import classNames from 'classnames';

dayjs.extend(relativeTime);

const HistoryBox = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.backgroundColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverBackgroundColor};
  }
`;

export default function History() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();

  const context: RecurringInvoiceContext = useOutletContext();
  const { recurringInvoice } = context;

  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['/api/v1/recurring_invoices', recurringInvoice?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/recurring_invoices/:id?include=activities.history&show_dates=true',
          { id: recurringInvoice?.id }
        )
      ).then(
        (response: GenericSingleResourceResponse<RecurringInvoice>) =>
          response.data.data
      ),
    enabled: Boolean(recurringInvoice?.id),
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
          'pb-6': resource?.activities && resource?.activities.length === 0,
        })}
      >
        {isLoading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        {!isLoading && resource?.activities && !resource.activities.length && (
          <div className="px-3 pt-3 text-sm">{t('api_404')}</div>
        )}

        {Boolean(resource?.activities?.length) && (
          <div className="flex flex-col w-full">
            {resource?.activities &&
              resource.activities.map((activity) => (
                <HistoryBox
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
                        {recurringInvoice?.client
                          ? formatMoney(
                              activity.history.amount || 0,
                              recurringInvoice?.client?.country_id,
                              recurringInvoice?.client?.settings.currency_id
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
                          recurringInvoice?.client
                        )}
                      >
                        {recurringInvoice?.client?.display_name}
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
                </HistoryBox>
              ))}
          </div>
        )}
      </div>
    </Card>
  );
}
