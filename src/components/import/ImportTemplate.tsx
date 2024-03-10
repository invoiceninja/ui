/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { MdDelete } from 'react-icons/md';
import { Element } from '../cards';
import { Icon } from '../icons/Icon';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { cloneDeep, set } from 'lodash';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { updateUser } from '$app/common/stores/slices/user';
import { User } from '$app/common/interfaces/user';
import { useState } from 'react';
import { useUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

interface Props {
  entity: string;
  name: string;
  onDeletedTemplate: () => void;
}
export function ImportTemplate(props: Props) {
  const dispatch = useDispatch();

  const { name, entity, onDeletedTemplate } = props;

  const user = useUserChanges();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleDeleteTemplate = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      const updatedUser = cloneDeep(user) as User;

      if (updatedUser) {
        const numberOfTemplates = Object.keys(
          updatedUser?.company_user?.react_settings?.import_templates?.[
            entity
          ] || {}
        ).length;

        if (numberOfTemplates > 1) {
          delete updatedUser?.company_user?.react_settings?.import_templates?.[
            entity
          ][name];
        } else {
          const numberOfEntities = Object.keys(
            updatedUser?.company_user?.react_settings?.import_templates || {}
          ).length;

          if (numberOfEntities > 1) {
            delete updatedUser?.company_user?.react_settings
              ?.import_templates?.[entity];
          } else {
            delete updatedUser?.company_user?.react_settings?.import_templates;
          }
        }

        request(
          'PUT',
          endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
          updatedUser
        )
          .then((response: GenericSingleResourceResponse<CompanyUser>) => {
            toast.success('updated_settings');

            set(updatedUser, 'company_user', response.data.data);

            $refetch(['company_users']);

            dispatch(updateUser(updatedUser));

            onDeletedTemplate();
          })
          .finally(() => setIsFormBusy(false));
      }
    }
  };

  return (
    <Element>
      <div className="flex items-center space-x-10">
        <span className="font-medium">{name}</span>

        <div
          className={classNames({
            'cursor-pointer': !isFormBusy,
            'cursor-not-allowed': isFormBusy,
          })}
          onClick={() => !isFormBusy && handleDeleteTemplate()}
        >
          <Icon element={MdDelete} size={22} />
        </div>
      </div>
    </Element>
  );
}
