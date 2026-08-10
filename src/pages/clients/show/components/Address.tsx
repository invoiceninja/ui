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
import { Client } from '$app/common/interfaces/client';
import { FormattedAddress } from '$app/components/FormattedAddress';
import { InfoCard } from '$app/components/InfoCard';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
}

export function Address(props: Props) {
  const { t } = useTranslation();

  const { client } = props;

  const colors = useColorScheme();

  return (
    <>
      {client && (
        <InfoCard
          title={t('address')}
          withoutTruncate
          className="shadow-sm h-full 2xl:h-max col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-3 p-4"
          style={{ borderColor: colors.$24 }}
          withoutPadding
        >
          <div className="flex flex-col pt-1 h-44 overflow-y-auto">
            <FormattedAddress
              address={client}
              className="break-all text-sm font-medium"
              style={{ color: colors.$3 }}
            />
          </div>
        </InfoCard>
      )}
    </>
  );
}
