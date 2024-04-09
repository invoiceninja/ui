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
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import {
  MdArchive,
  MdCloudCircle,
  MdDelete,
  MdDesignServices,
  MdPictureAsPdf,
  MdRestore,
  MdSettings,
} from 'react-icons/md';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { useConfigureClientSettings } from './useConfigureClientSettings';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { PurgeClientAction } from '../components/PurgeClientAction';
import { MergeClientAction } from '../components/MergeClientAction';
import { Dispatch, SetStateAction } from 'react';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useBulk } from '$app/common/queries/clients';

interface Params {
  setIsPurgeOrMergeActionCalled?: Dispatch<SetStateAction<boolean>>;
}
export function useActions(params?: Params) {
  const [t] = useTranslation();
  const bulk = useBulk();

  const { setIsPurgeOrMergeActionCalled } = params || {};

  const hasPermission = useHasPermission();

  const { isAdmin, isOwner } = useAdmin();

  const { isEditOrShowPage } = useEntityPageIdentifier({
    entity: 'client',
  });

  const configureClientSettings = useConfigureClientSettings();

  const { setChangeTemplateVisible, setChangeTemplateResources } =
    useChangeTemplate();

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
          onClick={() =>
            window.open(
              route(
                `${client.contacts[0].link}?silent=true&client_hash=:clientHash`,
                {
                  clientHash: client.client_hash,
                }
              ),
              '__blank'
            )
          }
          icon={<Icon element={MdCloudCircle} />}
        >
          {t('client_portal')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted &&
      (isAdmin || isOwner) && (
        <DropdownElement
          onClick={() => configureClientSettings(client)}
          icon={<Icon element={MdSettings} />}
        >
          {t('settings')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted &&
      hasPermission('create_invoice') && (
        <DropdownElement
          to={route('/invoices/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_invoice')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted &&
      hasPermission('create_payment') && (
        <DropdownElement
          to={route('/payments/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_payment')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted &&
      hasPermission('create_quote') && (
        <DropdownElement
          to={route('/quotes/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_quote')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted &&
      hasPermission('create_credit') && (
        <DropdownElement
          to={route('/credits/create?client=:id', { id: client.id })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_credit')}
        </DropdownElement>
      ),
    (client) =>
      !client.is_deleted &&
      (isAdmin || isOwner) &&
      client && (
        <MergeClientAction
          client={client}
          setIsPurgeOrMergeActionCalled={setIsPurgeOrMergeActionCalled}
        />
      ),
    (client) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([client]);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
    (client) =>
      isEditOrShowPage && !client.is_deleted && <Divider withoutPadding />,
    (client) =>
      isEditOrShowPage &&
      getEntityState(client) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([client.id], 'archive')}
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
          onClick={() => bulk([client.id], 'restore')}
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
          onClick={() => bulk([client.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
    (client) =>
      (isAdmin || isOwner) &&
      client && (
        <PurgeClientAction
          key="purge"
          client={client}
          setIsPurgeOrMergeActionCalled={setIsPurgeOrMergeActionCalled}
        />
      ),
  ];

  return actions;
}
