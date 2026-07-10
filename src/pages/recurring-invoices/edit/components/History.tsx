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
import classNames from 'classnames';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ArrowRight, ChevronRight } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Card } from '$app/components/cards';
import { DynamicLink } from '$app/components/DynamicLink';
import { History as HistoryIcon } from '$app/components/icons/History';
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { RecurringInvoiceContext } from '../../create/Create';

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
          <div className="flex flex-col w-full gap-3">
            {resource?.activities &&
              resource.activities.map((activity) => (
                <HistoryBox
                  className="flex items-center justify-between p-4 rounded-md cursor-pointer"
                  key={activity.id}
                  onClick={() =>
                    navigate(
                      route('/activities/:id', {
                        id: activity.id,
                      })
                    )
                  }
                  theme={{
                    backgroundColor: colors.$4,
                    hoverBackgroundColor: colors.$15,
                  }}
                >
                  <div className="flex items-center justify-start space-x-3">
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
                  </div>

                  <div>
                    <Icon element={ChevronRight} size={16} color={colors.$17} />
                  </div>
                </HistoryBox>
              ))}
          </div>
        )}
      </div>
    </Card>
  );
}
