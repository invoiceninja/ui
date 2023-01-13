/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { bulk } from 'common/queries/clients';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';
import {
  MdArchive,
  MdDelete,
  MdDeleteForever,
  MdPictureAsPdf,
} from 'react-icons/md';
import { BiPlusCircle } from 'react-icons/bi';
import { Icon } from 'components/icons/Icon';
import { toast } from 'common/helpers/toast/toast';

interface Props {
  clientId: string | undefined;
  openPurgeModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export function CustomResourcefulActions(props: Props) {
  const [t] = useTranslation();

  const handleResourcefulAction = (action: 'delete' | 'archive') => {
    toast.processing();

    if (props.clientId)
      bulk([props.clientId], action)
        .then(() => {
          toast.success(t(`${action}d_client`) || 'success');
        })
        .catch((error: AxiosError | unknown) => {
          console.error(error);
          toast.error();
        });
  };

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        <DropdownElement
          to={route('/clients/:id/statement', {
            id: props.clientId,
          })}
          icon={<Icon element={MdPictureAsPdf} />}
        >
          {t('view_statement')}
        </DropdownElement>

        <DropdownElement
          to={route('/invoices/create?client=:id', {
            id: props.clientId,
          })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_invoice')}
        </DropdownElement>

        <DropdownElement
          to={route('/payments/create?client=:id', {
            id: props.clientId,
          })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_payment')}
        </DropdownElement>

        <DropdownElement
          to={route('/quotes/create?client=:id', {
            id: props.clientId,
          })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_quote')}
        </DropdownElement>

        <DropdownElement
          to={route('/credits/create?client=:id', {
            id: props.clientId,
          })}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_credit')}
        </DropdownElement>
      </div>

      <div>
        <DropdownElement
          key={'archive'}
          onClick={() => {
            handleResourcefulAction('archive');
          }}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
        <DropdownElement
          key={'delete'}
          onClick={() => {
            handleResourcefulAction('delete');
          }}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
        <DropdownElement
          key={'purge'}
          onClick={() => {
            props.openPurgeModal(true);
          }}
          icon={<Icon element={MdDeleteForever} />}
        >
          {t('purge')}
        </DropdownElement>
      </div>
    </Dropdown>
  );
}
