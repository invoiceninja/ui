/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';

type Props = {
    Title:string,
    Amount:number,
    Currency:string,

};

export default function Total({Title,Amount,Currency}: Props) {



  return <div className="px-4 py-5 bg-white shadow rounded overflow-hidden sm:p-6 space-y-2">
      <h2>{Title}</h2>
      <p> {Currency}{new Intl.NumberFormat().format(Amount)}</p>
  </div>;
}
