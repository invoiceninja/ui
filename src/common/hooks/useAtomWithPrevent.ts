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
  atom,
  PrimitiveAtom,
  SetStateAction,
  useAtom,
  useSetAtom,
} from 'jotai';
import { Invoice } from '../interfaces/invoice';
import { useEffect, useState } from 'react';
import { cloneDeep, isEqual } from 'lodash';
import { preventLeavingPageAtom } from './useAddPreventNavigationEvents';
import { useParams } from 'react-router-dom';
import { diff } from 'deep-object-diff';
import { useDebounce } from 'react-use';

type Entity = Invoice;
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export const changesAtom = atom<any | null>(null);

export function useAtomWithPrevent(
  atom: PrimitiveAtom<Entity | undefined>
): [Entity | undefined, SetAtom<[SetStateAction<Invoice | undefined>], void>] {
  const { id } = useParams();

  const setChanges = useSetAtom(changesAtom);

  const [entity, setEntity] = useAtom(atom);
  const [preventLeavingPage, setPreventLeavingPage] = useAtom(
    preventLeavingPageAtom
  );

  const [currentInitialValue, setCurrentInitialValue] = useState<Entity>();

  const isFunctionalityDisabled =
    import.meta.env.VITE_DISABLE_PREVENT_NAVIGATION_FEATURE === 'true';

  useEffect(() => {
    if (
      entity &&
      currentInitialValue &&
      entity.id === currentInitialValue.id &&
      !isFunctionalityDisabled
    ) {
      const currentPreventValue = isEqual(entity, currentInitialValue);

      setChanges(diff(currentInitialValue, entity));

      const isDifferent = preventLeavingPage.prevent !== !currentPreventValue;

      isDifferent &&
        setPreventLeavingPage(
          (current) =>
            current && {
              ...current,
              prevent: !currentPreventValue,
            }
        );
    }
  }, [entity]);

  useEffect(() => {
    if (entity && entity.id === id && currentInitialValue) {
      setCurrentInitialValue(cloneDeep(entity));
      setPreventLeavingPage(
        (current) =>
          current && {
            ...current,
            prevent: false,
          }
      );
    }
  }, [entity?.updated_at]);

  useDebounce(
    () => {
      if (entity && (!id || entity.id === id) && !currentInitialValue) {
        setCurrentInitialValue(cloneDeep(entity));
      }
    },
    100,
    [entity, currentInitialValue]
  );

  useEffect(() => {
    return () => {
      setCurrentInitialValue(undefined);
      setPreventLeavingPage(
        (current) =>
          current && {
            ...current,
            prevent: false,
          }
      );
      setChanges(null);
    };
  }, []);

  return [entity, setEntity];
}
