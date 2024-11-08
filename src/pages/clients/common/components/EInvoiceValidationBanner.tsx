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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { Banner } from '$app/components/Banner';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdLocationOff } from 'react-icons/md';

interface Props {
  client: Client | undefined;
}

export function EInvoiceValidationBanner(props: Props) {
  const [t] = useTranslation();

  const { client } = props;

  const colors = useColorScheme();
  const company = useCurrentCompany();

  const areDetailsFilled = () => {
    return Boolean(
      client?.address1 &&
        client?.city &&
        client?.country_id &&
        client?.postal_code
    );
  };

  if (!client || !company?.settings.enable_e_invoice || areDetailsFilled()) {
    return null;
  }

  return (
    <Banner variant="orange">
      <div className="flex items-center w-full space-x-3 py-1">
        <Icon element={MdLocationOff} color={colors.$1} size={25} />

        <span style={{ color: colors.$1 }}>{t('client_address_required')}</span>
      </div>
    </Banner>
  );
}
