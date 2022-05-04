/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';

export function ActionCard(props: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 bg-white w-full p-8 rounded shadow my-4">
      <div className={`flex justify-between items-center`}>
        <section>
          <h2 className="text-gray-800">{props.label}</h2>
          {props.help && (
            <span className="text-xs text-gray-600">{props.help}</span>
          )}
        </section>
        {props.children}
      </div>
    </div>
  );
}
