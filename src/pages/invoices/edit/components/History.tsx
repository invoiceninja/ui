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
import { Invoice } from '$app/common/interfaces/invoice';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useOutletContext, useParams } from 'react-router-dom';
import { Context } from '../Edit';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Card, ClickableElement } from '$app/components/cards';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { DynamicLink } from '$app/components/DynamicLink';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import dayjs from 'dayjs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Spinner } from '$app/components/Spinner';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';

dayjs.extend(relativeTime);

export default function History() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();
  const { invoice } = context;

  const { id } = useParams();

  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['/api/v1/invoices', id, 'payments'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/invoices/${id}?include=payments,activities.history&reminder_schedule=true`
        )
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

  return (
    <Card title={t('history')} className="w-full xl:w-2/3">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {resource?.activities && !resource.activities.length && (
        <NonClickableElement>{t('api_404')}</NonClickableElement>
      )}

      {resource?.activities &&
        resource.activities.map((activity) => (
          <ClickableElement
            key={activity.id}
            to={`/activities/${activity.id}`}
            disableNavigation={Boolean(!activity.history.id)}
          >
            <div className="flex flex-col">
              <div className="flex space-x-1">
                <span>
                  {invoice?.client
                    ? formatMoney(
                        activity.history.amount,
                        invoice?.client?.country_id,
                        invoice?.client?.settings.currency_id
                      )
                    : null}
                </span>
                <span>&middot;</span>
                <DynamicLink
                  to={`/clients/${activity.client_id}`}
                  renderSpan={disableNavigation('client', invoice?.client)}
                >
                  {invoice?.client?.display_name}
                </DynamicLink>
              </div>

              <div className="inline-flex items-center space-x-1">
                <p>
                  {date(activity.created_at, `${dateFormat} ${timeFormat}`)}
                </p>
                <p>{dayjs.unix(activity.created_at).fromNow()}</p>
              </div>
            </div>
          </ClickableElement>
        ))}
    </Card>
  );
}
