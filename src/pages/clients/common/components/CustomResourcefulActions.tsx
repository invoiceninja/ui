/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { Client } from 'common/interfaces/client';
import { bulk } from 'common/queries/clients';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client | undefined;
  openPurgeModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export function CustomResourcefulActions(props: Props) {
  const [t] = useTranslation();
  const handleResourcefulAction = (action: 'delete' | 'archive') => {
    const toastId = toast.loading(t('processing'));
    if (props.client)
      bulk([props.client?.id], action)
        .then(() => {
          toast.success(t(`${action}d_client`), { id: toastId });
        })
        .catch((error: AxiosError | unknown) => {
          console.error(error);

          toast.dismiss();
          toast.error(t('error_title'));
        });
  };
  return (
    <Dropdown label={t('more_actions')}>
      <DropdownElement
        key={'archive'}
        onClick={() => {
          handleResourcefulAction('archive');
        }}
      >
        {t('archive')}
      </DropdownElement>
      <DropdownElement
        key={'delete'}
        onClick={() => {
          handleResourcefulAction('delete');
        }}
      >
        {t('delete')}
      </DropdownElement>
      <DropdownElement
        key={'purge'}
        onClick={() => {
          props.openPurgeModal(true);
        }}
      >
        {t('purge')}
      </DropdownElement>
    </Dropdown>
  );
}
