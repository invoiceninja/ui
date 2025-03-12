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
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Card } from '$app/components/cards';
import { Spinner } from '$app/components/Spinner';
import { QuoteActivity } from '$app/common/interfaces/quote-activity';
import { useGenerateActivityElement } from '../../common/components/QuoteSlider';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';

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
    <Card title={t('activity')} className="w-full xl:w-2/3">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {activities && !activities.length && (
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
