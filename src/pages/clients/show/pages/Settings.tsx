/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Card } from '$app/components/cards';
import { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

interface ClientGroupSettings {
  client_settings: Record<string, string | number | boolean>;
  group_settings: Record<string, string | number | boolean>;
}

const Div = styled.div`
  color: ${(props) => props.theme.color};

  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export default function Settings() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const { data: clientGroupSettings } = useQuery({
    queryKey: ['/api/v1/clients/show_settings', id],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/clients/:id/show_settings', { id })
      ).then((response: AxiosResponse<ClientGroupSettings>) => response.data),
    enabled: id !== null,
    staleTime: Infinity,
  });

  const formatValue = (value: string | number | boolean) => {
    if (typeof value === 'boolean') {
      return value ? t('yes') : t('no');
    }

    if (typeof value === 'string') {
      return t(value);
    }

    return value;
  };

  return (
    <div className="flex flex-col space-y-4 xl:flex-row xl:space-x-6 xl:space-y-0 w-full">
      <Card
        title={t('client_settings')}
        className="shadow-sm w-full xl:w-1/2 h-max pb-4"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        {clientGroupSettings?.client_settings &&
        !Array.isArray(clientGroupSettings?.client_settings) &&
        Object.keys(clientGroupSettings.client_settings).length > 0 ? (
          <div className="flex flex-col space-y-1 px-2 sm:px-4 pt-2">
            {Object.entries(clientGroupSettings.client_settings)
              .filter(
                ([key, value]) => key.toLowerCase() !== 'id' || !key || !value
              )
              .map(([key, value]) => (
                <Div
                  key={key}
                  className="flex w-full items-center space-x-2 px-2 py-1.5 rounded-sm"
                  theme={{ hoverColor: colors.$4, color: colors.$1 }}
                >
                  <div
                    className="font-medium w-1/2 whitespace-nowrap truncate"
                    style={{ color: colors.$3 }}
                  >
                    {key}
                  </div>

                  <div
                    className="w-1/2 whitespace-nowrap truncate"
                    style={{ color: colors.$3 }}
                  >
                    {formatValue(value)}
                  </div>
                </Div>
              ))}
          </div>
        ) : (
          <div
            className="px-4 sm:px-6 pt-2 font-medium"
            style={{ color: colors.$3 }}
          >
            {t('no_records_found')}.
          </div>
        )}
      </Card>

      <Card
        title={t('group_settings')}
        className="shadow-sm w-full xl:w-1/2 h-max pb-4"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        {clientGroupSettings?.group_settings &&
        !Array.isArray(clientGroupSettings?.group_settings) &&
        Object.keys(clientGroupSettings.group_settings).length > 0 ? (
          <div className="flex flex-col space-y-2 px-4 sm:px-6">
            {Object.entries(clientGroupSettings.group_settings)
              .filter(
                ([key, value]) => key.toLowerCase() !== 'id' || !key || !value
              )
              .map(([key, value]) => (
                <Div
                  key={key}
                  className="flex w-full items-center space-x-2 px-2 py-1.5 rounded-sm"
                  theme={{ hoverColor: colors.$4, color: colors.$1 }}
                >
                  <div
                    className="font-medium w-1/2 whitespace-nowrap truncate"
                    style={{ color: colors.$3 }}
                  >
                    {key}
                  </div>

                  <div
                    className="w-1/2 whitespace-nowrap truncate"
                    style={{ color: colors.$3 }}
                  >
                    {formatValue(value)}
                  </div>
                </Div>
              ))}
          </div>
        ) : (
          <div
            className="px-4 sm:px-6 pt-2 font-medium"
            style={{ color: colors.$3 }}
          >
            {t('no_records_found')}.
          </div>
        )}
      </Card>
    </div>
  );
}
