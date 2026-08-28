/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoint, isHosted, trans } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { useHandleStripeDisconnect } from '../../hooks/useHandleStripeDisconnect';
import { useResolveConfigValue } from '../../hooks/useResolveConfigValue';

interface Props {
  companyGateway: CompanyGateway;
}

export function StripeConnect(props: Props) {
  const [t] = useTranslation();

  const config = useResolveConfigValue(props.companyGateway);

  const accountId = config('account_id');
  const isConnected = isHosted() && Boolean(accountId);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const handleDisconnect = useHandleStripeDisconnect({
    companyGatewayId: props.companyGateway.id,
    accountId,
    setIsPasswordConfirmModalOpen,
    setIsFormBusy,
    isFormBusy,
  });

  const handleSetup = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'stripe_connect',
    }).then((response) =>
      window
        .open(
          route('https://invoicing.co/stripe/signup/:token', {
            token: response.data.hash,
          }),
          '_blank'
        )
        ?.focus()
    );
  };

  return (
    <>
      {isConnected && <Element leftSide={t('account_id')}>{accountId}</Element>}

      <Element>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSetup} type="secondary" behavior="button">
            {t('gateway_setup')}
          </Button>

          {isConnected && (
            <Button
              behavior="button"
              type="secondary"
              onClick={() => setIsWarningModalOpen(true)}
              disabled={isFormBusy}
              disableWithoutIcon
            >
              {t('disconnect')}
            </Button>
          )}
        </div>
      </Element>

      <Modal
        title={t('warning')}
        visible={isWarningModalOpen}
        onClose={setIsWarningModalOpen}
      >
        <div className="flex flex-col space-y-6">
          <span className="text-left font-medium">
            {trans('disconnect_stripe_confirmation', {
              account_id: accountId,
            })}
          </span>

          <Button
            behavior="button"
            onClick={() => {
              setIsWarningModalOpen(false);

              setTimeout(() => {
                setIsPasswordConfirmModalOpen(true);
              }, 310);
            }}
          >
            {t('continue')}
          </Button>
        </div>
      </Modal>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={handleDisconnect}
      />
    </>
  );
}
