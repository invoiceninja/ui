/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Card } from '$app/components/cards';
import { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

export default function Settings() {
  const [t] = useTranslation();

  const { id } = useParams();

  const { data: clientSettings } = useQuery({
    queryKey: ['/api/v1/clients/show_settings', id],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/clients/:id/show_settings', { id })
      ).then(
        (response: AxiosResponse<GenericManyResponse<ActivityRecord>>) =>
          response.data.data
      ),
    enabled: id !== null,
    staleTime: Infinity,
  });

  return <Card title={t('settings_configuration')}>Settings</Card>;
}
