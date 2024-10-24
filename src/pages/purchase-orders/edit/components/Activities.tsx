/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint, trans } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Card } from '$app/components/cards';
import { Spinner } from '$app/components/Spinner';
import { Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { PurchaseOrderActivity } from '$app/common/interfaces/purchase-order-activity';
import reactStringReplace from 'react-string-replace';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';

export function useGenerateActivityElement() {
  const [t] = useTranslation();

  return (activity: PurchaseOrderActivity) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {activity.client?.label}
        </Link>
      ),

      user: activity.user?.label ?? t('system'),

      invoice: (
        <Link
          to={route('/invoices/:id/edit', {
            id: activity.invoice?.hashed_id,
          })}
        >
          {activity?.invoice?.label}
        </Link>
      ),

      recurring_invoice: (
        <Link
          to={route('/recurring_invoices/:id/edit', {
            id: activity?.recurring_invoice?.hashed_id,
          })}
        >
          {activity?.recurring_invoice?.label}
        </Link>
      ),

      contact: (
        <Link
          to={route('/clients/:id/edit', {
            id: activity?.contact?.hashed_id,
          })}
        >
          {activity?.contact?.label}
        </Link>
      ),

      notes: activity?.notes && (
        <>
          <br />

          {activity?.notes}
        </>
      ),

      payment_amount: activity?.payment_amount?.label,

      payment: (
        <Link
          to={route('/payments/:id/edit', { id: activity?.payment?.hashed_id })}
        >
          {activity?.payment?.label}
        </Link>
      ),

      purchase_order: (
        <Link
          to={route('/purchase_orders/:id/edit', {
            id: activity?.purchase_order?.hashed_id,
          })}
        >
          {activity?.purchase_order?.label}
        </Link>
      ),
    };

    for (const [variable, value] of Object.entries(replacements)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      text = reactStringReplace(text, `:${variable}`, () => value);
    }

    return text;
  };
}

export default function Activities() {
  const [t] = useTranslation();

  const { id } = useParams();

  const activityElement = useGenerateActivityElement();

  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/v1/activities/entity', id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'purchase_order',
        entity_id: id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<PurchaseOrderActivity>>) =>
          response.data.data
      ),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

  return (
    <Card title={t('activity')} className="w-full xl:w-2/3">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isLoading && activities && !activities.length && (
        <NonClickableElement>{t('api_404')}</NonClickableElement>
      )}

      {activities?.map((activity) => (
        <NonClickableElement key={activity.id} className="flex flex-col">
          <p>{activityElement(activity)}</p>
          <p className="inline-flex items-center space-x-1">
            <p>{date(activity.created_at, `${dateFormat} ${timeFormat}`)}</p>
            <p>&middot;</p>
            <p>{activity.ip}</p>
          </p>
        </NonClickableElement>
      ))}
    </Card>
  );
}
