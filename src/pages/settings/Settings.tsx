/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function Settings() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/settings/company_details');
  });

  return <></>;
}
