/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Default } from 'components/layouts/Default';
import { AlertTriangle } from 'react-feather';

export function Unauthorized() {
  const { documentTitle } = useTitle('not_allowed');

  return (
    <Default>
      <div className="flex flex-col items-center mt-14 space-y-4">
        <AlertTriangle size={128} />

        <h1 className="text-2xl">{documentTitle}.</h1>
      </div>
    </Default>
  );
}
