/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Credit } from 'common/interfaces/credit';
import { setCurrentCreditProperty } from 'common/stores/slices/credits/extra-reducers/set-current-quote-property';
import { useDispatch } from 'react-redux';

export function useSetCurrentCreditProperty() {
  const dispatch = useDispatch();

  return (property: keyof Credit, value: unknown) => {
    dispatch(setCurrentCreditProperty({ property, value }));
  };
}
