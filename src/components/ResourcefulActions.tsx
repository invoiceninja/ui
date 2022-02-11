/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';
interface Actions {
  name: string;
  action?: any;
  to?: any;
}
type Props = {
  actions: Actions[];
  label:string
};

export default function RecorcefulActions(props: Props) {
  return (
    <Dropdown label={props.label}>
      {props.actions.map((action,index) => {
        return (
          <DropdownElement key={`action_${index}`}
            to={action.to}
            onClick={() => {
              action.action();
            }}
          >
            {action.name}
          </DropdownElement>
        );
      })}
    </Dropdown>
  );
}
