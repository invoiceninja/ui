/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Fragment, ReactNode } from 'react';
import { Dropdown } from './dropdown/Dropdown';

export type Action<T = unknown> = (resource: T) => ReactNode;

interface Props {
  resource: unknown;
  label: string;
  actions: Action<any>[];
}

export function ResourceActions(props: Props) {
  return (
    <Dropdown label={props.label}>
      {props.actions.map((action, index) => (
        <Fragment key={index}>{action(props.resource)}</Fragment>
      ))}
    </Dropdown>
  );
}
