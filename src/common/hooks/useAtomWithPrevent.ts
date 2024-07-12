/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PrimitiveAtom, SetStateAction, useAtom } from 'jotai';
import { Invoice } from '../interfaces/invoice';
import { useEffect, useState } from 'react';
import { cloneDeep, isEqual } from 'lodash';
import { preventLeavingPageAtom } from './useAddPreventNavigationEvents';
import { useDebounce } from 'react-use';
import { useParams } from 'react-router-dom';

type Entity = Invoice;
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export function useAtomWithPrevent(
  atom: PrimitiveAtom<Entity | undefined>
): [Entity | undefined, SetAtom<[SetStateAction<Invoice | undefined>], void>] {
  const { id } = useParams();

  const [entity, setEntity] = useAtom(atom);
  const [preventLeavingPage, setPreventLeavingPage] = useAtom(
    preventLeavingPageAtom
  );

  const [currentInitialValue, setCurrentInitialValue] = useState<Entity>();

  useEffect(() => {
    if (entity && currentInitialValue) {
      const currentPreventValue = isEqual(entity, currentInitialValue);

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
    900,
    [entity?.updated_at]
  );

  useDebounce(
    () => {
      if (entity && entity.id === id && !currentInitialValue) {
        setCurrentInitialValue(cloneDeep(entity));
      }
    },
    900,
    [entity]
  );

  useEffect(() => {
    if (entity && !id && !currentInitialValue) {
      setCurrentInitialValue(cloneDeep(entity));
    }
  }, [entity]);

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
    };
  }, []);

  return [entity, setEntity];
}
