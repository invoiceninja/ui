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
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Client } from '$app/common/interfaces/client';
import { Badge } from '$app/components/Badge';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentOnCreation } from '../..';

interface Props {
  resource: 'invoice' | 'credit';
  payment: PaymentOnCreation | undefined;
}

export function TableTotalFooter({ resource, payment }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const clientResolver = useClientResolver();

  const [resolvedClient, setResolvedClient] = useState<Client>();

  const resources = useMemo(() => {
    if (resource === 'invoice') {
      return payment?.invoices || [];
    }

    return payment?.credits || [];
  }, [resource, payment]);

  const getCalculatedTotal = () => {
    return resources.reduce((acc, resource) => acc + resource.amount, 0);
  };

  useEffect(() => {
    if (payment?.client_id) {
      clientResolver
        .find(payment.client_id)
        .then((client) => setResolvedClient(client));
    }
  }, [payment?.client_id]);

  if (!payment || resources.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-between rounded-b-md py-3 px-4 border-l border-r border-b text-sm"
      style={{
        borderColor: colors.$24,
      }}
    >
      <div className="flex items-center gap-x-2">
        <span className="font-medium" style={{ color: colors.$3 }}>
          {t('total')}:
        </span>

        <Badge variant="generic">
          {resources.length || 0} {t(`${resource}s`)}
        </Badge>
      </div>

      <span className="font-mono font-medium" style={{ color: colors.$3 }}>
        {formatMoney(
          getCalculatedTotal(),
          resolvedClient?.country_id,
          resolvedClient?.settings.currency_id
        )}
      </span>
    </div>
  );
}
