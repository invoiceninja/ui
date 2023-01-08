/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Card, ClickableElement } from '@invoiceninja/cards';
import { Button, InputField } from '@invoiceninja/forms';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Modal } from 'components/Modal';
import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';
import { useSelector } from 'react-redux';
import { RootState } from 'common/stores/store';

export function DangerZone() {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const state = useSelector((state: RootState) => state.companyUsers);

  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [purgeInputField, setPurgeInputField] = useState('');

  const purge = () => {
    const toastId = toast.loading(t('processing'));

    request(
      'POST',
      endpoint('/api/v1/companies/purge_save_settings/:id', {
        id: company.id,
      }),
      { cancellation_message: feedback },
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => toast.success(t('purge_successful'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() => setIsPurgeModalOpen(false));
  };

  const destroy = () => {
    const toastId = toast.loading(t('processing'));

    request(
      'DELETE',
      endpoint('/api/v1/companies/:id', {
        id: company.id,
      }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => window.location.reload())
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <>
      <Modal
        title={t('purge_data')}
        text={t('purge_data_message')}
        visible={isPurgeModalOpen}
        onClose={setIsPurgeModalOpen}
      >
        <InputField
          label={route(t('please_type_to_confirm'), {
            value: 'purge',
          })}
          id="purge_data"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPurgeInputField(event.target.value)
          }
          required
        />

        <InputField
          type="password"
          label={t('password')}
          id="password"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPassword(event.target.value)
          }
          required
        />

        {purgeInputField === 'purge' && (
          <Button onClick={purge}>{t('continue')}</Button>
        )}
      </Modal>

      <Modal
        title={
          state?.api.length > 1 ? t('delete_company') : t('cancel_account')
        }
        text={
          state?.api.length > 1
            ? `${t('delete_company_message')} (${company?.settings.name})`
            : t('cancel_account_message')
        }
        visible={isDeleteModalOpen}
        onClose={setIsDeleteModalOpen}
      >
        <InputField
          label={route(t('please_type_to_confirm'), {
            value: 'delete',
          })}
          id="cancel_account"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPurgeInputField(event.target.value)
          }
          required
        />

        <InputField
          type="text"
          label={t('reason_for_canceling')}
          id="feedback"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setFeedback(event.target.value)
          }
        />

        <InputField
          type="password"
          label={t('password')}
          id="password"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPassword(event.target.value)
          }
          required
        />

        {purgeInputField === 'delete' && (
          <Button onClick={destroy}>{t('continue')}</Button>
        )}
      </Modal>

      <Card title="Danger Zone">
        <ClickableElement
          onClick={() => setIsPurgeModalOpen(true)}
          className="text-red-500 hover:text-red-600"
        >
          {t('purge_data')}
        </ClickableElement>

        <span className="flex pl-6 mb-2">
          <i className="text-xs font-semibold">* {t('purge_data_message')}</i>
        </span>

        <ClickableElement
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-red-500 hover:text-red-600"
        >
          {state?.api.length > 1 ? t('delete_company') : t('cancel_account')}
        </ClickableElement>

        <span className="flex pl-6 mb-2">
          <i className="text-xs font-semibold">
            *{' '}
            {state?.api.length > 1
              ? `${t('delete_company_message')} (${company?.settings.name})`
              : t('cancel_account_message')}
          </i>
        </span>
      </Card>
    </>
  );
}
