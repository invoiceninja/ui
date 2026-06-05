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
import {
  isCalendarConnectionAvailable,
  isDevCalendarEnabled,
  isHosted,
} from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { route } from '$app/common/helpers/route';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useIsPaid } from '$app/common/hooks/usePaidOrSelfhost';
import {
  useConnectCalendar,
  useDisconnectCalendar,
} from '$app/common/queries/calendar';
import type { CalendarProvider } from '$app/common/interfaces/user';
import { updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Modal } from '$app/components/Modal';
import { Alert } from '$app/components/Alert';
import { Button, Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCalendarCheck, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { MdInfoOutline } from 'react-icons/md';

export function CalendarConnectCta() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const hosted = isHosted();
  const devCalendar = isDevCalendarEnabled();
  const calendarConnectionAvailable = isCalendarConnectionAvailable();
  const isPaid = useIsPaid();
  const isConnected =
    user?.settings?.calendar_connection?.status === 'CONNECTED';
  const canConnect =
    calendarConnectionAvailable && !isConnected && (isPaid || devCalendar);
  const showPlanAlert = hosted && !isConnected && !isPaid && !devCalendar;

  const connect = useConnectCalendar();
  const disconnect = useDisconnectCalendar();

  const [disconnectVisible, setDisconnectVisible] = useState(false);

  const handleConnect = (provider: CalendarProvider) => {
    if (!canConnect) return;

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
              settings: {
                ...(user.settings ?? {}),
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

  if (!calendarConnectionAvailable) {
    return null;
  }

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
          <span style={{ color: colors.$3 }}>
            {user?.settings?.calendar_connection?.email ?? t('disconnect')}
          </span>

          <button
            type="button"
            onClick={() => setDisconnectVisible(true)}
            disabled={disconnect.isLoading}
            aria-label={t('disconnect') as string}
            className="ml-1 p-1 leading-none text-base"
            style={{ color: colors.$17 }}
          >
            ×
          </button>
        </div>
      </>
    );
  }

  if (showPlanAlert) {
    return (
      <div className="flex flex-col space-y-3">
        <Alert type="warning" disableClosing>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon element={MdInfoOutline} size={20} />

              <span>{t('start_free_trial_message')}</span>
            </div>

            {user?.company_user && (
              <Link to={route('/settings/account_management')}>
                {t('plan_change')}
              </Link>
            )}
          </div>
        </Alert>

        <Dropdown
          disabled
          label={t('connect_calendar') as string}
          labelButtonBorderColor={colors.$5}
        />
      </div>
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
        {t('google')}
      </DropdownElement>
      <DropdownElement
        onClick={() => handleConnect('microsoft')}
        icon={<FaMicrosoft size={14} />}
      >
        {t('microsoft')}
      </DropdownElement>
    </Dropdown>
  );
}
