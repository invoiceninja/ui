import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { registerPasskey } from '$app/common/helpers/passkeys';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { updateUser } from '$app/common/stores/slices/user';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

interface PasskeyItem {
  id: string;
  name: string;
  created_at: number;
  last_used_at?: number;
}

export function PasskeyAuthenticationModal(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const user = useCurrentUser();

  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshPasskeys = () =>
    request('GET', endpoint('/api/v1/settings/passkeys')).then((response) =>
      setPasskeys(response.data.data ?? [])
    );

  useEffect(() => {
    if (props.visible) {
      refreshPasskeys();
    }
  }, [props.visible]);

  const onAddPasskey = async () => {
    setBusy(true);
    toast.processing();

    try {
      const optionsResponse = await request(
        'POST',
        endpoint('/api/v1/settings/passkeys/options'),
        {
          name,
        }
      );

      const credential = await registerPasskey(
        optionsResponse.data.data.publicKey
      );

      await request('POST', endpoint('/api/v1/settings/passkeys'), {
        challenge_token: optionsResponse.data.data.challenge_token,
        credential: credential.response,
        name: name || undefined,
      });

      dispatch(
        updateUser({
          ...user!,
          passkey_enabled: true,
          passkey_count: (user?.passkey_count || 0) + 1,
        })
      );

      await refreshPasskeys();
      toast.success('updated_settings');
      setName('');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 422) {
        toast.error('validation_error');
      } else {
        toast.error('error_title');
      }
    } finally {
      setBusy(false);
    }
  };

  const onDeletePasskey = (id: string) =>
    request('DELETE', endpoint(`/api/v1/settings/passkeys/${id}`)).then(
      async () => {
        const nextCount = Math.max((user?.passkey_count || 1) - 1, 0);
        dispatch(
          updateUser({
            ...user!,
            passkey_enabled: nextCount > 0,
            passkey_count: nextCount,
          })
        );

        await refreshPasskeys();
        toast.success('updated_settings');
      }
    );

  return (
    <Modal title={t('passkey')} visible={props.visible} onClose={props.setVisible}>
      <div className="space-y-4">
        <InputField
          id="passkey_name"
          label={t('name')}
          value={name}
          onValueChange={(value) => setName(value)}
          placeholder={t('optional')}
        />

        <Button behavior="button" disabled={busy} onClick={onAddPasskey}>
          {t('add')}
        </Button>

        <div className="space-y-2">
          {passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <div className="font-semibold">{passkey.name || t('passkey')}</div>
                <div className="text-sm opacity-80">{passkey.id}</div>
              </div>

              <Button
                behavior="button"
                type="minimal"
                onClick={() => onDeletePasskey(passkey.id)}
              >
                {t('remove')}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
