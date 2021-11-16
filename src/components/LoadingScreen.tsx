/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Loading from "./icons/Loading";

export function LoadingScreen() {
  return (
    <div className="grid place-items-center h-screen">
      <div className="text-gray-900">
        <Loading variant="dark" />
      </div>
    </div>
  );
}
