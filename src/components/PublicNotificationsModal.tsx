/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './forms';
import Toggle from './forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useDispatch } from 'react-redux';
import { updateChanges } from '$app/common/stores/slices/user';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { get } from 'lodash';

export function PublicNotificationsModal() {
  const reactSettings = useReactSettings();
  const dispatch = useDispatch();

  const [isVisible, setIsVisible] = useState(false);

  const { t } = useTranslation();
  const { save } = usePreferences();

  function handleSave() {
    const existing = get(
      reactSettings,
      'preferences.enable_public_notifications',
      null
    );

    if (existing === null) {
      dispatch(
        updateChanges({
          property:
            'company_user.react_settings.preferences.enable_public_notifications',
          value: false,
        })
      );
    }

    save({ silent: true });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        get(reactSettings, 'preferences.enable_public_notifications') === null
      ) {
        setIsVisible(true);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [reactSettings]);

  return (
    <>
      <Modal
        title="Notifications"
        visible={isVisible}
        onClose={() => {
          setIsVisible(false);

          dispatch(
            updateChanges({
              property:
                'company_user.react_settings.preferences.enable_public_notifications',
              value: false,
            })
          );

          save({ silent: true });
        }}
        size="small"
      >
        <p>
          Hello! You can now receive real-time notifications from Invoice Ninja!
        </p>
        <p>
          This means you will be connected to the official Invoice Ninja
          servers, so we'd like to ask for your preference.
        </p>
        <p>
          Please note, you'll only see this modal once. If you'd like to change
          your settings, you can do so in settings menu.
        </p>

        <Toggle
          label="Enable notifications"
          checked={Boolean(reactSettings?.dark_mode)}
          onChange={(value) =>
            dispatch(
              updateChanges({
                property:
                  'company_user.react_settings.preferences.enable_public_notifications',
                value,
              })
            )
          }
        />

        <div className="flex justify-end space-x-1 pt-5">
          <Button
            onClick={() => {
              setIsVisible(false);
              handleSave();
            }}
          >
            {t('save_changes')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
