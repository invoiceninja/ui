/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from 'common/enums/entity-state';
import { getEntityState } from 'common/helpers';
import { route } from 'common/helpers/route';
import { Client } from 'common/interfaces/client';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Icon } from 'components/icons/Icon';
import { Action } from 'components/ResourceActions';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { BiGitMerge, BiPlusCircle } from 'react-icons/bi';
import {
  MdArchive,
  MdCloudCircle,
  MdDelete,
  MdDeleteForever,
  MdEdit,
  MdPictureAsPdf,
  MdRestore,
} from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { useBulk } from './useBulk';

interface Params {
  setIsMergeModalOpen: Dispatch<SetStateAction<boolean>>;
  setMergeFromClientId?: Dispatch<SetStateAction<string>>;
  setPasswordConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
  setPurgeClientId?: Dispatch<SetStateAction<string>>;
}

export function useActions(params: Params) {
  const [t] = useTranslation();
  const bulk = useBulk();
  const location = useLocation();

  const actions: Action<Client>[] = [
    (client) =>
      !client.is_deleted &&
      !location.pathname.endsWith('/clients') &&
      !location.pathname.endsWith('/edit') && (
        <DropdownElement
          to={route('/clients/:id/edit', { id: client.id })}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    (client) =>
      !location.pathname.endsWith('/clients') &&
      !location.pathname.endsWith('/edit') &&
      !client.is_deleted && <Divider withoutPadding />,
    (client) =>
      !client.is_deleted && (
        <DropdownElement
          to={route('/clients/:id/statement', { id: client.id })}
          icon={<Icon element={MdPictureAsPdf} />}
        >
          {t('view_statement')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted && (
        <DropdownElement
          onClick={() => window.open(client.contacts[0].link, '__blank')}
          icon={<Icon element={MdCloudCircle} />}
        >
          {t('client_portal')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted && (
        <DropdownElement
          to={route('/invoices/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_invoice')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted && (
        <DropdownElement
          to={route('/payments/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_payment')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted && (
        <DropdownElement
          to={route('/quotes/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_quote')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted && (
        <DropdownElement
          to={route('/credits/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_credit')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted && (
        <DropdownElement
          onClick={() => {
            params.setMergeFromClientId?.(client.id);
            params.setIsMergeModalOpen(true);
          }}
          icon={<Icon element={BiGitMerge} />}
        >
          {t('merge')}
        </DropdownElement>
      ),
    (client) =>
      !location.pathname.endsWith('/clients') &&
      !client.is_deleted && <Divider withoutPadding />,
    (client) =>
      !location.pathname.endsWith('/clients') &&
      getEntityState(client) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk(client.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (client) =>
      !location.pathname.endsWith('/clients') &&
      (getEntityState(client) === EntityState.Archived ||
        getEntityState(client) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk(client.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (client) =>
      !location.pathname.endsWith('/clients') &&
      (getEntityState(client) === EntityState.Active ||
        getEntityState(client) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk(client.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
    (client) => (
      <DropdownElement
        key="purge"
        onClick={() => {
          params.setPurgeClientId?.(client.id);
          params.setPasswordConfirmModalOpen(true);
        }}
        icon={<Icon element={MdDeleteForever} />}
      >
        {t('purge')}
      </DropdownElement>
    ),
  ];

  return actions;
}
