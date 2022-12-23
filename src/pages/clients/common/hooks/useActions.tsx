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
    (resource: Client) => (
      <DropdownElement
        to={route('/clients/:id/statement', { id: resource.id })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_statement')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        onClick={() => window.open(resource.contacts[0].link, '__blank')}
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/invoices/create?client=:id', { id: resource.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_invoice')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/payments/create?client=:id', { id: resource.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_payment')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/quotes/create?client=:id', { id: resource.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_quote')}
      </DropdownElement>
    ),
    (resource: Client) => (
      <DropdownElement
        to={route('/credits/create?client=:id', { id: resource.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_credit')}
      </DropdownElement>
    ),
  ];

  return actions;
}
