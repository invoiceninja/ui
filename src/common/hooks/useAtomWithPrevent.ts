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
import { cloneDeep, flatMapDeep, isEqual, isObject, keys } from 'lodash';
import { preventLeavingPageAtom } from './useAddPreventNavigationEvents';
import { useParams } from 'react-router-dom';
import { diff } from 'deep-object-diff';
import { useDebounce } from 'react-use';

type Entity = Invoice;
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export const changesAtom = atom<any | null>(null);

const EXCLUDING_PROPERTIES_KEYS = [
  'public_notes',
  'private_notes',
  'terms',
  'footer',
];

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

  const buildPaths = (currentEntity: Entity, path = ''): string[] => {
    return flatMapDeep(keys(currentEntity), (key) => {
      const value = currentEntity[key as keyof Entity];
      const newPath = path ? `${path}.${key}` : key;

      if (isObject(value)) {
        return buildPaths(value as unknown as Entity, newPath);
      }

      return newPath;
    });
  };

  const generatePaths = (currentEInvoice: Entity, currentPath = '') => {
    return buildPaths(currentEInvoice, currentPath);
  };

  useEffect(() => {
    if (
      entity &&
      currentInitialValue &&
      entity.id === currentInitialValue.id &&
      !isFunctionalityDisabled
    ) {
      const currentEntityPaths = generatePaths(entity);

      const currentPathsForExcluding = currentEntityPaths.filter((path) =>
        EXCLUDING_PROPERTIES_KEYS.some((excludingPropertyKey) =>
          path.includes(excludingPropertyKey)
        )
      );

      currentPathsForExcluding.forEach((path) => {
        if (!path.includes('.')) {
          delete entity[path as unknown as keyof Entity];
          delete currentInitialValue[path as unknown as keyof Entity];
        }
      });

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

  useDebounce(
    () => {
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
    },
    50,
    [entity?.updated_at]
  );

  useDebounce(
    () => {
      if (entity && (!id || entity.id === id) && !currentInitialValue) {
        setCurrentInitialValue(cloneDeep(entity));
      }
    },
    50,
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
