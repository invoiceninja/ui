/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { UploadImport } from 'components/import/UploadImport';

export function Backup() {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12">
        <UploadImport entity="company" onSuccess={false} type="zip" />
      </div>
    </div>
  );
}
