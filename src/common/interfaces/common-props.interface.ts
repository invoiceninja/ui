/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from "react";

export default interface CommonProps {
  id?: any;
  className?: string;
  children?: ReactNode;
  onChange?: any;
  value?: any;
  onClick?: any;
}
