/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { Client } from 'common/interfaces/client';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Icon } from 'components/icons/Icon';
import { Action } from 'components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { MdCloudCircle, MdPictureAsPdf } from 'react-icons/md';

export function useActions() {
  const [t] = useTranslation();

  const actions: Action<Client>[] = [
    (client) => (
      <DropdownElement
        to={route('/clients/:id/statement', { id: client.id })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_statement')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        onClick={() => window.open(client.contacts[0].link, '__blank')}
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/invoices/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_invoice')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/payments/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_payment')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/quotes/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_quote')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/credits/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_credit')}
      </DropdownElement>
    ),
  ];

  return actions;
}
