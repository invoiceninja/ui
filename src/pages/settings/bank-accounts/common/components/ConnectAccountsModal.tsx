/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdLink } from 'react-icons/md';
import yodleeLogo from '/dap-logos/yodlee.svg';
import classNames from 'classnames';
import { useAccentColor } from '$app/common/hooks/useAccentColor';

export function ConnectAccountsModal() {
  const [t] = useTranslation();

  const accentColor = useAccentColor();

  const [account, setAccount] = useState<'yodlee' | 'nordigen'>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handleConnectYodlee = async () => {
    const tokenResponse = await request(
      'POST',
      endpoint('/api/v1/one_time_token'),
      { context: 'yodlee', platform: 'react' }
    );
    window.open(
      route('https://invoicing.co/yodlee/onboard/:hash', {
        hash: tokenResponse?.data?.hash,
      })
    );
  };

  const handleConnectNordigen = async () => {
    const tokenResponse = await request(
      'POST',
      endpoint('/api/v1/one_time_token'),
      { context: 'nordigen', platform: 'react' }
    );
    window.open(
      route('https://invoicing.co/yodlee/onboard/:hash', {
        hash: tokenResponse?.data?.hash,
      })
    );
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
      <Button type="secondary" onClick={() => setIsModalVisible(true)}>
        <span className="mr-2">{<Icon element={MdLink} size={20} />}</span>
        {t('connect_accounts')}
      </Button>

      <Modal
        title={t('connect_accounts')}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setAccount(undefined);
        }}
      >
        <div className="flex flex-col space-y-6">
          <div
            className={classNames('flex cursor-pointer', {
              'border-4': account === 'yodlee',
            })}
            style={{ borderColor: accentColor }}
            onClick={() => setAccount('yodlee')}
          >
            <img className="flex-1" src={yodleeLogo} />
          </div>

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
