/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import {
  useConnectCalendar,
  useDisconnectCalendar,
} from '$app/common/queries/calendar';
import { CalendarProvider } from '$app/common/interfaces/user';
import { updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCalendarCheck, FaGoogle, FaMicrosoft } from 'react-icons/fa';

export function CalendarConnectCta() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const isConnected =
    user?.referral_meta?.calendar_connection?.status === 'CONNECTED';

  const connect = useConnectCalendar();
  const disconnect = useDisconnectCalendar();

  const [disconnectVisible, setDisconnectVisible] = useState(false);

  const handleConnect = (provider: CalendarProvider) => {
    // Guard against double-click: the one_time_token is single-use, so a
    // second mutation would waste the first hash and could race the redirect.
    if (connect.isLoading) return;

    toast.processing();

    connect.mutate(provider, {
      onSuccess: (url) => {
        // Top-level redirect: same tab, no popup. The backend's callback
        // will land the user back on the app and the full bootstrap will
        // pick up the new calendar_connection status from /api/v1/refresh.
        window.location.href = url;
      },
      onError: () => {
        toast.error();
      },
    });
  };

  const handleDisconnect = () => {
    toast.processing();
    disconnect.mutate(undefined, {
      onSuccess: () => {
        // Redux holds the current user; flip the status locally so the chip
        // returns to the connect CTA immediately without waiting on refetch.
        if (user) {
          dispatch(
            updateUser({
              ...user,
              referral_meta: {
                ...(user.referral_meta ?? {}),
                calendar_connection: { status: 'DISCONNECTED' },
              },
            })
          );
        }
        toast.success('disconnect_calendar');
        setDisconnectVisible(false);
      },
      onError: () => {
        toast.error();
      },
    });
  };

  if (isConnected) {
    return (
      <>
        <Modal
          title={t('are_you_sure')}
          visible={disconnectVisible}
          onClose={() => setDisconnectVisible(false)}
        >
          <div className="flex flex-col space-y-6">
            <span className="font-medium text-sm">
              {t('disconnect_calendar_confirmation')}
            </span>

            <Button
              behavior="button"
              onClick={handleDisconnect}
              disabled={disconnect.isLoading}
              disableWithoutIcon
            >
              {t('continue')}
            </Button>
          </div>
        </Modal>

        <div
          className="inline-flex items-center gap-2 py-2 px-4 rounded-md border shadow-sm text-sm"
          style={{
            borderColor: colors.$24,
            backgroundColor: colors.$1,
            color: colors.$3,
          }}
        >
          <FaCalendarCheck size={14} color={colors.$3} />
          <span>{t('calendar_connected')}</span>
          <button
            type="button"
            onClick={() => setDisconnectVisible(true)}
            disabled={disconnect.isLoading}
            aria-label={t('disconnect_calendar') as string}
            className="ml-1 p-1 leading-none text-base"
            style={{ color: colors.$17 }}
          >
            ×
          </button>
        </div>
      </>
    );
  }

  return (
    <Dropdown
      label={t('connect_calendar') as string}
      labelButtonBorderColor={colors.$5}
    >
      <DropdownElement
        onClick={() => handleConnect('google')}
        icon={<FaGoogle size={14} />}
      >
        {t('connect_google_calendar')}
      </DropdownElement>
      <DropdownElement
        onClick={() => handleConnect('microsoft')}
        icon={<FaMicrosoft size={14} />}
      >
        {t('connect_microsoft_calendar')}
      </DropdownElement>
    </Dropdown>
  );
}
