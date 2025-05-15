/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { Modal } from '$app/components/Modal';
import { useTranslation } from 'react-i18next';
import { PopupProps } from './NewCreditCard';
import { useQuery, useQueryClient } from 'react-query';
import { AxiosResponse } from 'axios';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { AddCreditCard } from './AddCreditCard';
import { toast } from '$app/common/helpers/toast/toast';
import { Button } from '$app/components/forms';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';

export function StartTrial({ visible, onClose }: PopupProps) {
  const { t } = useTranslation();
  const account = useCurrentAccount();
    const refresh = useRefreshCompanyUsers();

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

  const handleStartTrial = () => {
    if (!methods?.length) {
      return;
    }

    request('POST', endpoint('/api/client/account_management/start_trial'), {
      account_key: account?.key,
    })
      .then(() => {
        toast.success(t('trial_success')!);
        
        refresh();
        onClose();
      })
      .catch((error) => {
        toast.error();
      });
  };

  return (
    <Modal visible={visible} onClose={onClose} size="regular">
      <div className="space-y-4">
        <div>
        <p className="text-lg font-bold">{t('free_trial')}</p>
          <p className="text-sm">
            {t('trial_message')}
          </p>
          <p className="text-sm py-2">
            At the end of your 14 day trial your card will be charged $12/month. Cancel anytime.
          </p>
        </div>

        {methods?.length === 0 ? (
          <AddCreditCard onClose={onClose} startTrial={true} />
        ) : (
          <div className="flex justify-end">
            <Button behavior="button" type="primary" onClick={handleStartTrial}>
              {t('trial_call_to_action')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}