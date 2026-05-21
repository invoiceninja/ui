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
import { route } from '$app/common/helpers/route';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { Client } from '$app/common/interfaces/client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';
import { Icon } from './icons/Icon';
import { Tooltip } from './Tooltip';
import { Link } from './forms';

interface Props {
  client?: Client;
  clientId?: string;
}

export function PaymentTermsTooltip({ client, clientId }: Props) {
  const [t] = useTranslation();

  const getSetting = useGetSetting();

  const colors = useColorScheme();
  const clientResolver = useClientResolver();

  const [resolvedClient, setResolvedClient] = useState<Client | undefined>(
    client
  );

  useEffect(() => {
    if (client) {
      setResolvedClient(client);

      return;
    }

    if (clientId) {
      clientResolver.find(clientId).then((c) => setResolvedClient(c));

      return;
    }

    setResolvedClient(undefined);
  }, [client, clientId]);

  const { paymentTerms, hasPaymentTerms } = useMemo(() => {
    const value = resolvedClient
      ? getSetting(resolvedClient, 'payment_terms')
      : undefined;

    return {
      paymentTerms: value,
      hasPaymentTerms: value && Number(value) > 0,
    };
  }, [resolvedClient]);

  if (!resolvedClient) {
    return null;
  }

  return (
    <Tooltip
      width="auto"
      placement="top"
      withoutArrow
      tooltipElement={
        <div className="flex flex-col space-y-1 whitespace-nowrap text-left">
          <span>
            {t('payment_terms')}:{' '}
            {hasPaymentTerms
              ? `${t('net')} ${paymentTerms} ${t('days')}`
              : t('none')}
          </span>

          <Link
            to={route('/clients/:id/settings', { id: resolvedClient.id })}
            className="text-xs"
          >
            {t('configure')}
          </Link>
        </div>
      }
    >
      <Icon
        element={MdInfoOutline}
        size={16}
        style={{ color: colors.$22, opacity: 0.7 }}
      />
    </Tooltip>
  );
}
