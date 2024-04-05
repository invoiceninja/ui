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
import { useDefaultCommonActions } from './useCommonActions';
import { useEntityPageIdentifier } from './useEntityPageIdentifier';
import { useCurrentUser } from './useCurrentUser';

interface Params {
  commonActionsSection: boolean;
  entity: Entity;
}
export function useShowActionByPreferences(params: Params) {
  const user = useCurrentUser();

  const { commonActionsSection, entity } = params;

  const { isEditPage } = useEntityPageIdentifier({ entity });

  const defaultCommonActions = useDefaultCommonActions();

  return (actionKey: string) => {
    if (!isEditPage) {
      return true;
    }

    const commonActionsPreferences =
      user?.company_user?.react_settings.common_actions;

    if (!commonActionsPreferences) {
      return true;
    }

    if (
      !commonActionsSection &&
      commonActionsPreferences?.[entity] &&
      !commonActionsPreferences[entity]?.includes(actionKey)
    ) {
      return true;
    }

    if (
      !commonActionsPreferences?.[entity] &&
      defaultCommonActions[entity].some(({ value }) => value === actionKey) &&
      commonActionsSection
    ) {
      return true;
    }

    if (commonActionsPreferences && commonActionsSection) {
      return commonActionsPreferences[entity]?.includes(actionKey);
    }

    if (!commonActionsPreferences?.[entity] && !commonActionsSection) {
      return !defaultCommonActions[entity]?.some(
        ({ value }) => value === actionKey
      );
    }

    return false;
  };
}
