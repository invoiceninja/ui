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
import { lastHistoryLocationAtom, preventLeavingPageAtom } from '$app/App';
import { useNavigate } from 'react-router-dom';

export function PreventNavigationModal() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { nonPreventedLocations } = useAtomValue(lastHistoryLocationAtom);
  const blockedNavigationAction = useAtomValue(blockedNavigationActionAtom);
  const [preventLeavingPage, setPreventLeavingPage] = useAtom(
    preventLeavingPageAtom
  );
  const [isNavigationModalVisible, setIsNavigationModalVisible] = useAtom(
    isNavigationModalVisibleAtom
  );

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handleDiscardChanges = () => {
    const isBrowserBackAction = preventLeavingPage.actionKey === 'browserBack';

    setPreventLeavingPage({ prevent: false, actionKey: undefined });
    setIsNavigationModalVisible(false);

    isBrowserBackAction && history.back();

    if (blockedNavigationAction) {
      const { url, externalLink, fn } = blockedNavigationAction;

      if (url) {
        if (url === 'back') {
          const lastNonPreventedLocation =
            nonPreventedLocations[nonPreventedLocations.length - 2];

          lastNonPreventedLocation && navigate(lastNonPreventedLocation);
        } else {
          if (externalLink) {
            window.open(url, '_blank');
          } else {
            navigate(url);
          }
        }
      }

      fn?.();
    }
  };

  const handleContinueEditing = () => {
    const isBrowserBackAction = preventLeavingPage.actionKey === 'browserBack';

    setPreventLeavingPage(
      (current) =>
        current && {
          ...current,
          actionKey:
            current.actionKey !== 'browserBack' ? undefined : current.actionKey,
        }
    );
    setIsNavigationModalVisible(false);

    isBrowserBackAction &&
      history.pushState(null, document.title, window.location.href);
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
