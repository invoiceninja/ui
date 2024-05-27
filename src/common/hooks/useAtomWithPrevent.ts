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
import { useEffect, useRef, useState } from 'react';
import { cloneDeep, isEqual } from 'lodash';
import { preventLeavingPageAtom } from './useAddPreventNavigationEvents';

type Entity = Invoice;
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export function useAtomWithPrevent(
  atom: PrimitiveAtom<Entity | undefined>
): [Entity | undefined, SetAtom<[SetStateAction<Invoice | undefined>], void>] {
  const initialValueTimeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  const [entity, setEntity] = useAtom(atom);
  const [preventLeavingPage, setPreventLeavingPage] = useAtom(
    preventLeavingPageAtom
  );

  const [currentInitialValue, setCurrentInitialValue] = useState<Entity>();

  useEffect(() => {
    if (entity && currentInitialValue) {
      const isDifferent =
        preventLeavingPage.prevent !== !isEqual(entity, currentInitialValue);

      isDifferent &&
        setPreventLeavingPage(
          (current) =>
            current && {
              ...current,
              prevent: !isEqual(entity, currentInitialValue),
            }
        );
    }
  }, [entity, currentInitialValue]);

  useEffect(() => {
    if (entity && currentInitialValue) {
      setCurrentInitialValue(cloneDeep(entity));
    }
  }, [entity?.updated_at]);

  useEffect(() => {
    if (entity && !currentInitialValue) {
      clearTimeout(initialValueTimeOut.current);

      const currentTimeout = setTimeout(
        () => setCurrentInitialValue(cloneDeep(entity)),
        100
      );

      initialValueTimeOut.current = currentTimeout;
    }
  }, [entity]);

  return [entity, setEntity];
}
