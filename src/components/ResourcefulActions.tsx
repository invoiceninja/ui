/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';
interface Actions {
  name: string;
  action?: any;
  to?: any;
}
type Props = {
  resource: string;
  actions: Actions[];
};

export default function RecorcefulActions(props: Props) {
  const [t] = useTranslation();
  return (
    <Dropdown label={t('actions')}>
      {props.actions.map((action) => {
        return (
          <DropdownElement
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
