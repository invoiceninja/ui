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
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { Client } from '$app/common/interfaces/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';
import { Icon } from './icons/Icon';
import { Tooltip } from './Tooltip';
import { Link } from './forms';

interface Props {
  client?: Client;
}

export function PaymentTermsTooltip({ client }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const getSetting = useGetSetting();

  const { paymentTerms, hasPaymentTerms } = useMemo(() => {
    const value = client ? getSetting(client, 'payment_terms') : undefined;

    return {
      paymentTerms: value,
      hasPaymentTerms: value && Number(value) > 0,
    };
  }, [client]);

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

          <Link to="/settings/payment_terms" className="text-xs">
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
