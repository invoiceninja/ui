/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button } from '@invoiceninja/forms';
import { Modal } from 'components/Modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function TwoFactorAuthentication() {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Modal
        title={t('enable_two_factor')}
        visible={isModalOpen}
        onClose={setIsModalOpen}
      ></Modal>

      <Card title={t('enable_two_factor')}>
        <Element leftSide="2FA">
          <Button
            behaviour="button"
            type="minimal"
            onClick={() => setIsModalOpen(true)}
          >
            {t('Enable')}
          </Button>
        </Element>
      </Card>
    </>
  );
}
