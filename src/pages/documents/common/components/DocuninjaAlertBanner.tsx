/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { isPaidDocuninjaUserAtom } from '../../Document';
import { useTranslation } from 'react-i18next';
import { Alert } from '$app/components/Alert';
import { Button } from '$app/components/forms';
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';
import { useQueryClient } from 'react-query';

export function DocuninjaAlertBanner() {
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const isPaidUser = useAtomValue(isPaidDocuninjaUserAtom);

  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  return (
    <>
      {!isPaidUser && (
        <Alert type="warning" className="mb-4">
          <div className="flex justify-between items-center">
            <span>{t('upgrade_account_message')}</span>

            <Button onClick={() => setShowUpgradeModal(true)} behavior="button">
              {t('upgrade_now')}
            </Button>
          </div>
        </Alert>
      )}

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onPaymentComplete={() => {
          queryClient.invalidateQueries(['/api/docuninja/login']);
          setShowUpgradeModal(false);
        }}
      />
    </>
  );
}
