/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, getEntityState } from '$app/common/helpers';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { EntityState } from '$app/common/enums/entity-state';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { Divider } from '$app/components/cards/Divider';
import { Settings } from 'react-feather';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { route } from '$app/common/helpers/route';
import { useConfigureGroupSettings } from './useConfigureGroupSettings';
import { useBulk } from '$app/common/queries/group-settings';

export function useActions() {
  const [t] = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const configureGroupSettings = useConfigureGroupSettings();

  const { id } = useParams();

  const bulk = useBulk();

  const isEditPage = location.pathname.includes(id!);

  const fetchGroupSettingsDetails = async (groupSettingsId: string) => {
    const groupSettingsResponse = await queryClient.fetchQuery(
      ['/api/v1/group_settings', groupSettingsId],
      () =>
        request(
          'GET',
          endpoint('/api/v1/group_settings/:id', { id: groupSettingsId })
        ).then(
          (response: GenericSingleResourceResponse<GroupSettings>) =>
            response.data.data
        ),
      { staleTime: Infinity }
    );

    configureGroupSettings(groupSettingsResponse);
  };

  const actions: Action<GroupSettings>[] = [
    (group) =>
      !isEditPage && (
        <DropdownElement
          onClick={() => fetchGroupSettingsDetails(group.id)}
          icon={<Icon className="h-4 w-4" element={Settings} />}
        >
          {t('configure_settings')}
        </DropdownElement>
      ),
    (group) =>
      getEntityState(group) === EntityState.Active && (
        <DropdownElement
          onClick={() =>
            navigate(
              route('/clients/create?group=:groupId', {
                groupId: group.id,
              })
            )
          }
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_client')}
        </DropdownElement>
      ),
    () => isEditPage && <Divider withoutPadding />,
    (group) =>
      isEditPage &&
      getEntityState(group) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([group.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (group) =>
      isEditPage &&
      (getEntityState(group) === EntityState.Archived ||
        getEntityState(group) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([group.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (group) =>
      isEditPage &&
      (getEntityState(group) === EntityState.Active ||
        getEntityState(group) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([group.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
