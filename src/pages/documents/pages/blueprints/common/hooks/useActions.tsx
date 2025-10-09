/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';

interface UseActionsParams {
  onSettingsClick: (blueprint: Blueprint) => void;
}

export function useActions(params: UseActionsParams) {
  const [t] = useTranslation();
  const { onSettingsClick } = params;

  const actions: Action<Blueprint>[] = [
    (blueprint: Blueprint) => (
      <DropdownElement
        onClick={() => onSettingsClick(blueprint)}
        icon={<Icon element={MdSettings} />}
      >
        {t('settings')}
      </DropdownElement>
    ),
  ];

  return actions;
}
