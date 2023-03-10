/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { resetChanges } from '$app/common/stores/slices/company-users';
import { useDispatch } from 'react-redux';

export function useDiscardChanges() {
  const dispatch = useDispatch();

  return () => dispatch(resetChanges('company'));
}
