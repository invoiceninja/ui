/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Entity,
  commonActionsPreferencesAtom,
} from '$app/components/CommonActionsPreferenceModal';
import { useAtomValue } from 'jotai';
import { useDefaultCommonActions } from './useCommonActions';
import { useEntityPageIdentifier } from './useEntityPageIdentifier';

interface Params {
  commonActionsSection: boolean;
  entity: 'invoice';
}
export function useShowActionByPreferences(params: Params) {
  const commonActionsPreferences = useAtomValue(commonActionsPreferencesAtom);

  const { commonActionsSection, entity } = params;

  const { isEditPage } = useEntityPageIdentifier({ entity });

  const defaultCommonActions = useDefaultCommonActions();

  return (entity: Entity, actionKey: string) => {
    if (!isEditPage) {
      return true;
    }

    if (
      !commonActionsSection &&
      commonActionsPreferences?.[entity] &&
      !commonActionsPreferences[entity]?.some(
        ({ value }) => value === actionKey
      )
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
      return commonActionsPreferences[entity]?.some(
        ({ value }) => value === actionKey
      );
    }

    if (!commonActionsPreferences?.[entity] && !commonActionsSection) {
      return !defaultCommonActions[entity]?.some(
        ({ value }) => value === actionKey
      );
    }

    return false;
  };
}
