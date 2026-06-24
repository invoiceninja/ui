/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import {
  PublicKeyCredentialCreationOptionsJSON,
  registerPasskey,
} from '$app/common/helpers/passkeys';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { updateUser } from '$app/common/stores/slices/user';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useDateTime } from '$app/common/hooks/useDateTime';
import { useColorScheme } from '$app/common/colors';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

interface Passkey {
  id: string;
  name: string;
  last_used_at?: number;
}

export function PasskeyAuthenticationModal(props: Props) {
  const [t] = useTranslation();

  const dispatch = useDispatch();
  const user = useCurrentUser();
  const colors = useColorScheme();

  const dateTime = useDateTime({ formatOnlyDate: true });

  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [name, setName] = useState<string>('');
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const refreshPasskeys = () => {
    return request('GET', endpoint('/api/v1/settings/passkeys')).then(
      (response) => setPasskeys(response.data.data ?? [])
    );
  };

  useEffect(() => {
    if (props.visible) {
      refreshPasskeys();
    }
  }, [props.visible]);

  const handleAddPasskey = async () => {
    setIsFormBusy(true);
    toast.processing();

    try {
      const optionsResponse = await request(
        'POST',
        endpoint('/api/v1/settings/passkeys/options'),
        { name }
      );

      const credential = await registerPasskey(
        optionsResponse.data.data.publicKey as PublicKeyCredentialCreationOptionsJSON
      );

      await request('POST', endpoint('/api/v1/settings/passkeys'), {
        challenge_token: optionsResponse.data.data.challenge_token,
        credential: {
          id: credential.id,
          rawId: credential.rawId,
          type: credential.type,
          ...credential.response,
        },
        name: name || undefined,
      });

      dispatch(
        updateUser({
          ...user!,
          passkey_enabled: true,
          passkey_count: (user?.passkey_count ?? 0) + 1,
        })
      );

      await refreshPasskeys();

      toast.success('updated_settings');
      setName('');
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        toast.error();
      } else {
        toast.dismiss();
      }
    } finally {
      setIsFormBusy(false);
    }
  };

  const handleDeletePasskey = (id: string) => {
    return request('DELETE', endpoint('/api/v1/settings/passkeys/:id', { id }))
      .then(async () => {
        const nextCount = Math.max((user?.passkey_count ?? 1) - 1, 0);

        dispatch(
          updateUser({
            ...user!,
            passkey_enabled: nextCount > 0,
            passkey_count: nextCount,
          })
        );

        await refreshPasskeys();

        toast.success('updated_settings');
      })
      .catch(() => toast.error());
  };

  return (
    <Modal
      title={t('manage_passkeys')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
    >
      <div className="space-y-4">
        <InputField
          id="passkey_name"
          label={t('name')}
          value={name}
          onValueChange={(value) => setName(value)}
          placeholder={t('optional')}
        />

        <Button
          behavior="button"
          disabled={isFormBusy}
          onClick={handleAddPasskey}
        >
          {t('add')}
        </Button>

        {passkeys.length > 0 && (
          <div className="space-y-2">
            {passkeys.map((passkey) => {
              return (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between rounded border p-3"
                  style={{ borderColor: colors.$5 }}
                >
                  <div>
                    <div className="font-medium" style={{ color: colors.$3 }}>
                      {passkey.name || t('passkey')}
                    </div>

                    <div className="text-sm" style={{ color: colors.$17 }}>
                      {t('last_used')}:{' '}
                      {passkey.last_used_at
                        ? dateTime(passkey.last_used_at)
                        : t('never')}
                    </div>
                  </div>

                  <Button
                    behavior="button"
                    type="minimal"
                    onClick={() => handleDeletePasskey(passkey.id)}
                  >
                    {t('remove')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
