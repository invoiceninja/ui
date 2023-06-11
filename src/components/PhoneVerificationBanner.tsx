/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState } from 'react';
import { Banner } from './Banner';
import { useTranslation } from 'react-i18next';
import { PhoneVerificationModal } from './PhoneVerificationModal';

export function PhoneVerificationBanner() {
  const [t] = useTranslation();

  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  return (
    <>
      <Banner className="space-x-3">
        <span>{t('verify_phone_number_help')}.</span>

        <div className="flex space-x-1">
          <span
            className="font-medium text-xs md:text-sm text-blue-500 hover:underline cursor-pointer"
            onClick={() => setIsModalOpened(true)}
          >
            {t('verify_phone_number_help')}
          </span>

          <span className="font-medium text-blue-500">&rarr;</span>
        </div>
      </Banner>

      <PhoneVerificationModal
        visible={isModalOpened}
        setVisible={setIsModalOpened}
      />
    </>
  );
}
