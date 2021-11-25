/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ReactNode } from "react";

export function Container(props: { children: ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="container max-w-2xl">{props.children}</div>
    </div>
  );
}
