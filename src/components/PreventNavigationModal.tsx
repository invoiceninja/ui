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
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { isNavigationModalVisibleAtom } from '$app/common/hooks/usePreventNavigation';
import { preventClosingTabOrBrowserAtom } from '$app/App';

export function PreventNavigationModal() {
  const [t] = useTranslation();

  const setPreventNavigation = useSetAtom(preventClosingTabOrBrowserAtom);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isNavigationModalVisible, setIsNavigationModalVisible] = useAtom(
    isNavigationModalVisibleAtom
  );

  const handleCloseModal = () => {
    setPreventNavigation(false);
    setIsNavigationModalVisible(false);
  };

  useEffect(() => {
    setIsModalVisible(isNavigationModalVisible);
  }, [isNavigationModalVisible]);

  return (
    <Modal
      visible={isModalVisible}
      onClose={() => handleCloseModal()}
      overflowVisible
    >
      <span>{t('error_unsaved_changes')}</span>

      <Button>{t('save')}</Button>
    </Modal>
  );
}
