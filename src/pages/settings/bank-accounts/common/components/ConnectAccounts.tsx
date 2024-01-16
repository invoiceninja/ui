/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdLink } from 'react-icons/md';
import yodleeLogo from '/dap-logos/yodlee.svg';
import goCardlessLogo from '/dap-logos/goCardless.png';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useClickAway } from 'react-use';
import { useColorScheme } from '$app/common/colors';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';

export function ConnectAccounts() {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const colors = useColorScheme();

  const divRef = useRef<HTMLDivElement>(null);

  const [account, setAccount] = useState<'yodlee' | 'nordigen'>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useClickAway(divRef, () => {
    setAccount(undefined);
  });

  const handleClose = () => {
    setIsModalVisible(false);
    setAccount(undefined);
  };

  const handleConnectYodlee = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'yodlee',
      platform: 'react',
    }).then((tokenResponse) => {
      handleClose();

      window.open(
        route('https://invoicing.co/yodlee/onboard/:hash', {
          hash: tokenResponse?.data?.hash,
        })
      );
    });
  };

  const handleConnectNordigen = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'nordigen',
      platform: 'react',
    }).then((tokenResponse) => {
      handleClose();

      window.open(
        endpoint('/nordigen/connect/:hash', {
          hash: tokenResponse?.data?.hash,
        })
      );
    });
  };

  const handleConnectAccount = () => {
    if (account === 'yodlee') {
      handleConnectYodlee();
    }

    if (account === 'nordigen') {
      handleConnectNordigen();
    }
  };

  return (
    <>
      <Button
        type="secondary"
        onClick={() =>
          isSelfHosted() ? handleConnectNordigen() : setIsModalVisible(true)
        }
      >
        <span className="mr-2">{<Icon element={MdLink} size={20} />}</span>
        {t('connect_accounts')}
      </Button>

      <Modal
        title={t('connect_accounts')}
        visible={isModalVisible}
        onClose={handleClose}
      >
        <div ref={divRef} className="flex flex-col space-y-6">
          {enterprisePlan() && (
            <div
              className="flex cursor-pointer h-44 border-4"
              style={{
                borderColor: account === 'yodlee' ? accentColor : colors.$5,
              }}
              onClick={() => setAccount('yodlee')}
            >
              <img className="flex-1" src={yodleeLogo} />
            </div>
          )}

          {enterprisePlan() && (
            <div
              data-cy="nordigenBox"
              className="flex cursor-pointer py-14 px-12 h-44 border-4"
              style={{
                borderColor: account === 'nordigen' ? accentColor : colors.$5,
              }}
              onClick={() => setAccount('nordigen')}
            >
              <img className="flex-1" src={goCardlessLogo} />
            </div>
          )}

          <Button
            onClick={handleConnectAccount}
            disableWithoutIcon
            disabled={!account}
          >
            {t('connect')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
