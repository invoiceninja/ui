/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { Navigate, useParams } from 'react-router-dom';

export function Show() {
  const { id } = useParams();

  return <Navigate to={route('/products/:id/edit', { id })} />;
}
