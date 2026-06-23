/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';

export function useWebAuthnSupport() {
  const [isSupported] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      typeof window.PublicKeyCredential !== 'undefined'
  );

  return isSupported;
}
