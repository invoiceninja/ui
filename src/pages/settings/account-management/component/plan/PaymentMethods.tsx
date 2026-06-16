/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Divider } from '$app/components/cards/Divider';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { CreditCard } from './CreditCard';
import { DeleteCreditCard } from './DeleteCreditCard';
import { NewCreditCard } from './NewCreditCard';

interface PaymentMethodsProps {
  withDivider?: boolean;
}

export function PaymentMethods({ withDivider = true }: PaymentMethodsProps) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const account = useCurrentAccount();
  const { t } = useTranslation();

  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [createPopupVisible, setCreatePopupVisible] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<CompanyGateway | null>(
    null
  );

  const { data: methods } = useQuery({
    queryKey: ['/api/client/account_management/methods', account?.id],
    queryFn: () =>
      request('POST', endpoint('/api/client/account_management/methods'), {
        account_key: account?.key,
      }).then(
        (response: AxiosResponse<GenericManyResponse<CompanyGateway>>) =>
          response.data.data
      ),
    enabled: Boolean(account),
  });

  if (!account) {
    return null;
  }

  return (
    <>
      {withDivider && (
        <div className="px-7 pt-3">
          <Divider
            className="border-dashed"
            withoutPadding
            borderColor={colors.$20}
          />
        </div>
      )}

      <div className="px-7 py-3 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">{t('payment_methods')}</h4>

          <button
            type="button"
            style={{ color: accentColor }}
            className="text-sm hover:underline flex items-center space-x-1"
            onClick={() => setCreatePopupVisible(true)}
          >
            <Plus size={18} /> <span>{t('add_payment_method')}</span>
          </button>

          <NewCreditCard
            visible={createPopupVisible}
            onClose={() => setCreatePopupVisible(false)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {methods?.length === 0 ? (
            <button
              type="button"
              className="flex items-center flex-col w-full lg:w-72 p-8 rounded border"
              style={{ borderColor: colors.$11.toString() }}
              onClick={() => setCreatePopupVisible(true)}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <Plus size={48} />
                <p>{t('add_payment_method')}</p>
              </div>
            </button>
          ) : null}

          {methods?.map((method) => (
            <CreditCard
              key={method.id}
              onDelete={() => {
                setSelectedGateway(method);
                setDeletePopupVisible(true);
              }}
              gateway={method}
            />
          ))}
        </div>
      </div>

      <DeleteCreditCard
        gateway={selectedGateway}
        visible={deletePopupVisible}
        onClose={() => {
          setSelectedGateway(null);
          setDeletePopupVisible(false);
        }}
      />
    </>
  );
}
