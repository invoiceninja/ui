/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { ArrowLeft } from 'react-feather';

export function Designer() {
  return (
    <div className="flex">
      <div className="h-screen w-1/3 bg-gray-100">
        <div className="inline-flex items-center p-4">
          <Link className="inline-flex items-center space-x-1" to="/settings">
            <ArrowLeft size={16} />
            <span>Back to settings</span>
          </Link>
        </div>
      </div>
      <div className="h-screen w-full bg-gray-300 flex justify-center overflow-y-auto p-10">
        <div
          className="bg-white p-10 rounded"
          style={{ minWidth: 960, minHeight: 1280 }}
        >
          Preview
        </div>
      </div>
    </div>
  );
}
