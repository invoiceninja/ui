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
import { cloneDeep } from 'lodash';
import { toast } from '$app/common/helpers/toast/toast';
import { useState } from 'react';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import {
  useReactSettings,
  useSaveReactSettings,
} from '$app/common/hooks/useReactSettings';
import classNames from 'classnames';

interface Props {
  entity: string;
  name: string;
  onDeletedTemplate: () => void;
}
export function ImportTemplate(props: Props) {
  const { name, entity, onDeletedTemplate } = props;

  const currentUser = useCurrentUser();
  const reactSettings = useReactSettings();
  const saveSettings = useSaveReactSettings();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleDeleteTemplate = () => {
    if (!isFormBusy && currentUser) {
      const importTemplates = cloneDeep(reactSettings?.import_templates ?? {});

      const numberOfTemplates = Object.keys(
        importTemplates?.[entity] || {}
      ).length;

      let nextTemplates: typeof importTemplates;
      if (numberOfTemplates > 1) {
        delete importTemplates?.[entity][name];
        nextTemplates = importTemplates;
      } else {
        const numberOfEntities = Object.keys(importTemplates || {}).length;

        if (numberOfEntities > 1) {
          delete importTemplates?.[entity];
          nextTemplates = importTemplates;
        } else {
          // `undefined` is omitted on the wire; `{}` persists the delete.
          nextTemplates = {};
        }
      }

      toast.processing();
      setIsFormBusy(true);

      saveSettings('import_templates', nextTemplates)
        .then(() => {
          toast.success('updated_settings');
          onDeletedTemplate();
        })
        .catch(() => toast.dismiss())
        .finally(() => setIsFormBusy(false));
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
