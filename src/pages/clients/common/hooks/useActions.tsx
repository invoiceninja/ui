/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { Client } from '$app/common/interfaces/client';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { BiGitMerge, BiPlusCircle } from 'react-icons/bi';
import {
  MdArchive,
  MdCloudCircle,
  MdDelete,
  MdDeleteForever,
  MdPictureAsPdf,
  MdRestore,
} from 'react-icons/md';
import { useBulk } from './useBulk';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';

interface Params {
  setIsMergeModalOpen: Dispatch<SetStateAction<boolean>>;
  setMergeFromClientId?: Dispatch<SetStateAction<string>>;
  setPasswordConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
  setPurgeClientId?: Dispatch<SetStateAction<string>>;
}

export function useActions(params: Params) {
  const [t] = useTranslation();
  const bulk = useBulk();

  const { isEditOrShowPage } = useEntityPageIdentifier({
    entity: 'client',
  });

  const actions: Action<Client>[] = [
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
      isEditOrShowPage && !client.is_deleted && <Divider withoutPadding />,
    (client) =>
      isEditOrShowPage &&
      getEntityState(client) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk(client.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (client) =>
      isEditOrShowPage &&
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
      isEditOrShowPage &&
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
