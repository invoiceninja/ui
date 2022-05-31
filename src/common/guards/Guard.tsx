/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Unauthorized } from 'pages/errors/401';

interface Props {
  guards: { (): boolean }[];
  component: JSX.Element;
}

export function Guard(props: Props) {
  let pass = true;

  props.guards.forEach((guard) => (pass = guard()));

  return pass ? props.component : <Unauthorized />;
}
