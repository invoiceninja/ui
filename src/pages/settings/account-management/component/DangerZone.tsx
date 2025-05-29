/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Button, InputField } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Modal } from '$app/components/Modal';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { useSelector } from 'react-redux';
import { RootState } from '$app/common/stores/store';
import { toast } from '$app/common/helpers/toast/toast';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { Trash } from '$app/components/icons/Trash';
import { TrashXMark } from '$app/components/icons/TrashXMark';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function DangerZone() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCurrentCompany();

  const companyUsers = useSelector((state: RootState) => state.companyUsers);

  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [purgeInputField, setPurgeInputField] = useState('');

  const purge = () => {
    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/companies/purge_save_settings/:id', {
        id: company.id,
      }),
      { cancellation_message: feedback },
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => toast.success('purge_successful'))
      .catch((error) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
        }
      })
      .finally(() => setIsPurgeModalOpen(false));
  };

  const destroy = () => {
    toast.processing();

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
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
        }
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

        <Button
          behavior="button"
          onClick={purge}
          disabled={purgeInputField !== 'purge' || !password}
          disableWithoutIcon
        >
          {t('continue')}
        </Button>
      </Modal>

      <Modal
        title={
          companyUsers?.api.length > 1
            ? t('delete_company')
            : t('cancel_account')
        }
        text={
          companyUsers?.api.length > 1
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

        <Button
          behavior="button"
          onClick={destroy}
          disabled={purgeInputField !== 'delete' || !password}
          disableWithoutIcon
        >
          {t('continue')}
        </Button>
      </Modal>

      <div className="flex flex-col space-y-4 px-4 sm:px-6 pt-2 pb-4">
        <Box
          className="flex space-x-2 items-center p-4 border shadow-sm w-full rounded-md cursor-pointer text-red-500 hover:text-red-600"
          theme={{
            backgroundColor: colors.$1,
            hoverBackgroundColor: colors.$4,
          }}
          onClick={() => setIsPurgeModalOpen(true)}
          style={{ borderColor: colors.$24 }}
        >
          <div>
            <TrashXMark color="#ef4444" size="1.4rem" />
          </div>

          <span className="text-sm">{t('purge_data')}</span>
        </Box>

        <Box
          className="flex space-x-2 items-center p-4 border shadow-sm w-full rounded-md cursor-pointer text-red-500 hover:text-red-600"
          theme={{
            backgroundColor: colors.$1,
            hoverBackgroundColor: colors.$4,
          }}
          onClick={() => setIsDeleteModalOpen(true)}
          style={{ borderColor: colors.$24 }}
        >
          <div>
            <Trash color="#ef4444" size="1.4rem" />
          </div>

          <span className="text-sm">
            {companyUsers?.api.length > 1
              ? t('delete_company')
              : t('cancel_account')}
          </span>
        </Box>
      </div>
    </>
  );
}
