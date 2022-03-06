/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { generatePath, Navigate, useParams } from 'react-router-dom';

export function Show() {
  const { id } = useParams();

  return <Navigate to={generatePath('/vendors/:id/edit', { id })} />;
}
