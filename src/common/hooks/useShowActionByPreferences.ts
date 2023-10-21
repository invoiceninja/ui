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

interface Params {
  commonActionsSection?: boolean;
}
export function useShowActionByPreferences(params: Params) {
  const commonActionsPreferences = useAtomValue(commonActionsPreferencesAtom);

  const { commonActionsSection } = params;

  const defaultCommonActions = useDefaultCommonActions();

  return (entity: Entity, actionKey: string) => {
    if (!commonActionsSection && !commonActionsPreferences?.[entity]) {
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

    return false;
  };
}
