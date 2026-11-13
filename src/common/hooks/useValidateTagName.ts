/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export const useValidateTagName = () => {
  const [t] = useTranslation();

  return (name: string | undefined): ValidationBag | undefined => {
    if (!name?.includes(',')) {
      return undefined;
    }

    const message = t('commas_not_allowed');

    return { message, errors: { name: [message] } };
  };
};
