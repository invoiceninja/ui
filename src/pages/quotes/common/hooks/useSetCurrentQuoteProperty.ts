/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Quote } from 'common/interfaces/quote';
import { setCurrentQuoteProperty } from 'common/stores/slices/quotes/extra-reducers/set-current-quote-property';
import { useDispatch } from 'react-redux';

export function useSetCurrentQuoteProperty() {
  const dispatch = useDispatch();

  return (property: keyof Quote, value: unknown) => {
    dispatch(setCurrentQuoteProperty({ property, value }));
  };
}
