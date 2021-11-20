/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from "react";
import { Lock, Smartphone, Book } from "react-feather";

export function HostedLinks() {
  return (
    <div className="grid grid-cols-3 text-sm">
      <div className="col-span-3 md:col-span-1">
        <a
          href="https://status.invoiceninja.com/"
          target="_blank"
          className="py-3 w-full hover:bg-gray-100 px-2 py-1 inline-flex justify-center items-center"
        >
          <Lock size={15} />
          <span className="m-1">Check status</span>
        </a>
      </div>
      <div className="col-span-3 md:col-span-1">
        <a
          href="https://www.invoiceninja.com/mobile/"
          target="_blank"
          className="py-3 w-full hover:bg-gray-100 px-2 py-1 inline-flex justify-center items-center"
        >
          <Smartphone size={15} />
          <span className="m-1">Applications</span>
        </a>
      </div>
      <div className="col-span-3 md:col-span-1">
        <a
          href="https://invoiceninja5.github.io"
          target="_blank"
          className="py-3 w-full hover:bg-gray-100 px-2 py-1 inline-flex justify-center items-center"
        >
          <Book size={15} />
          <span className="m-1">Documentation</span>
        </a>
      </div>
    </div>
  );
}
