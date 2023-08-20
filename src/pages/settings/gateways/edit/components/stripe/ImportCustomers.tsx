/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { Card, ClickableElement } from '$app/components/cards';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ImportCustomers() {
  const [t] = useTranslation();
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);
  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const $import = (password: string) => {
    toast.processing();

    request(
      'post',
      endpoint('/api/v1/stripe/import_customers'),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => toast.success('imported_customers'))
      .catch((error) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }
      });
  };

  return (
    <>
      <Card title={t('import_customers')}>
        <ClickableElement onClick={() => setIsPasswordConfirmModalOpen(true)}>
          {t('click_to_continue')}
        </ClickableElement>
      </Card>

      <PasswordConfirmation
        onSave={$import}
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
      />
    </>
  );
}
