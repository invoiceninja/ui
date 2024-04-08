/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useClientValidationMessageAlias } from '$app/pages/clients/common/hooks/useClientValidationMessageAlias';

interface Params {
  entity?: 'client';
}

export function useValidationMessageAlias(params: Params) {
  const { entity } = params;

  const clientValidationMessageAlias = useClientValidationMessageAlias();

  return (property: string, message: string[]) => {
    if (entity === 'client') {
      return clientValidationMessageAlias(property, message);
    }

    return message;
  };
}
