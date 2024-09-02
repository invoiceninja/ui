/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './forms';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import {
  blockedNavigationActionAtom,
  isNavigationModalVisibleAtom,
} from '$app/common/hooks/usePreventNavigation';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  lastHistoryLocationAtom,
  preventLeavingPageAtom,
} from '$app/common/hooks/useAddPreventNavigationEvents';
import { changesAtom } from '$app/common/hooks/useAtomWithPrevent';

export function PreventNavigationModal() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isTrackingChangesEnabled =
    import.meta.env.VITE_ENABLE_DISCARD_CHANGES_TRACKING === 'true';

  const changes = useAtomValue(changesAtom);

  const [lastHistoryLocation, setLastHistoryLocation] = useAtom(
    lastHistoryLocationAtom
  );
  const blockedNavigationAction = useAtomValue(blockedNavigationActionAtom);
  const [preventLeavingPage, setPreventLeavingPage] = useAtom(
    preventLeavingPageAtom
  );
  const [isNavigationModalVisible, setIsNavigationModalVisible] = useAtom(
    isNavigationModalVisibleAtom
  );

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { nonPreventedLocations } = lastHistoryLocation;

  const handleDiscardChanges = () => {
    const isBrowserBackAction = preventLeavingPage.actionKey === 'browserBack';

    const { url, externalLink, fn } = blockedNavigationAction || {};

    if (!externalLink) {
      setLastHistoryLocation((current) => ({
        ...current,
        lastLocation: '',
      }));
      setPreventLeavingPage({ prevent: false, actionKey: undefined });
    }

    const numberOfNonPreventedLocations = nonPreventedLocations.length;

    let lastNonPreventedLocation =
      nonPreventedLocations[numberOfNonPreventedLocations - 1];

    lastNonPreventedLocation =
      lastNonPreventedLocation !== location.pathname
        ? lastNonPreventedLocation
        : nonPreventedLocations[numberOfNonPreventedLocations - 2];

    if (isBrowserBackAction && lastNonPreventedLocation) {
      navigate(lastNonPreventedLocation);
    }

    if (blockedNavigationAction) {
      if (url) {
        if (externalLink) {
          window.open(url, '_blank');
        } else {
          navigate(url);
        }
      }

      fn?.();
    }

    setIsNavigationModalVisible(false);
  };

  const handleContinueEditing = () => {
    const isBrowserBackAction = preventLeavingPage.actionKey === 'browserBack';

    setPreventLeavingPage(
      (current) =>
        current && {
          ...current,
          actionKey:
            current.actionKey !== 'browserBack' ? undefined : 'browserBack',
        }
    );
    setIsNavigationModalVisible(false);

    if (isBrowserBackAction) {
      history.pushState(null, document.title, window.location.href);
    }
  };

  useEffect(() => {
    setIsModalVisible(isNavigationModalVisible);
  }, [isNavigationModalVisible]);

  return (
    <Modal visible={isModalVisible} onClose={() => {}} disableClosing>
      <div className="flex flex-col space-y-8">
        <span className="font-medium text-lg text-center">
          {t('error_unsaved_changes')}
        </span>

        {changes && isTrackingChangesEnabled && (
          <span className="break-words">{JSON.stringify(changes)}</span>
        )}

        <div className="flex justify-between">
          <Button type="secondary" onClick={handleContinueEditing}>
            {t('continue_editing')}
          </Button>
          <Button onClick={handleDiscardChanges}>{t('discard_changes')}</Button>
        </div>
      </div>
    </Modal>
  );
}
