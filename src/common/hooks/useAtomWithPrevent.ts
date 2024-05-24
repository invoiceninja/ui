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
import { isEqual } from 'lodash';
import { preventLeavingPageAtom } from './useAddPreventNavigationEvents';

type Entity = Invoice;
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export function useAtomWithPrevent(
  atom: PrimitiveAtom<Entity | undefined>
): [Entity | undefined, SetAtom<[SetStateAction<Invoice | undefined>], void>] {
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
    if (entity) {
      setCurrentInitialValue(entity);
    }
  }, [entity?.updated_at]);

  useEffect(() => {
    return () => {
      setPreventLeavingPage({
        prevent: false,
        actionKey: undefined,
      });
    };
  }, []);

  return [entity, setEntity];
}
