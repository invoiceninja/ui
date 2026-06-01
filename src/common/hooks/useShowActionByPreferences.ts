/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Entity } from '$app/components/CommonActionsPreferenceModal';
import { useEntityPageIdentifier } from './useEntityPageIdentifier';
import { useReactSettings } from './useReactSettings';

interface Params {
  commonActionsSection: boolean;
  entity: Entity;
}
export function useShowActionByPreferences(params: Params) {
  const reactSettings = useReactSettings();

  const { commonActionsSection, entity } = params;

  const { isEditPage } = useEntityPageIdentifier({ entity });

  return (actionKey: string) => {
    if (!isEditPage) {
      return true;
    }

    const commonActionsPreferences = reactSettings.common_actions;

    if (!commonActionsSection && !commonActionsPreferences?.[entity]) {
      return true;
    }

    if (
      !commonActionsSection &&
      commonActionsPreferences?.[entity] &&
      !commonActionsPreferences[entity]?.includes(actionKey)
    ) {
      return true;
    }

    if (commonActionsPreferences?.[entity] && commonActionsSection) {
      return commonActionsPreferences[entity]?.includes(actionKey);
    }

    return false;
  };
}
