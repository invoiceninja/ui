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
import { toast } from '$app/common/helpers/toast/toast';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { Card, ClickableElement } from '$app/components/cards';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ImportCustomers() {
  const [t] = useTranslation();

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const $import = (password: string, isPasswordRequired: boolean) => {
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
          onWrongPasswordEnter(isPasswordRequired);
          setIsPasswordConfirmModalOpen(true);
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
