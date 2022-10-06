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
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { route } from 'common/helpers/route';

interface Props {
  clientId: string | undefined;
  openPurgeModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export function CustomResourcefulActions(props: Props) {
  const [t] = useTranslation();

  const handleResourcefulAction = (action: 'delete' | 'archive') => {
    const toastId = toast.loading(t('processing'));

    if (props.clientId)
      bulk([props.clientId], action)
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
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
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
      </div>

      <div>
        <DropdownElement
          to={route('/clients/:id/statement', {
            id: props.clientId,
          })}
        >
          {t('view_statement')}
        </DropdownElement>

        <DropdownElement
          to={route('/invoices/create?client=:id', {
            id: props.clientId,
          })}
        >
          {t('new_invoice')}
        </DropdownElement>

        <DropdownElement
          to={route('/payments/create?client=:id', {
            id: props.clientId,
          })}
        >
          {t('new_payment')}
        </DropdownElement>

        <DropdownElement
          to={route('/quotes/create?client=:id', {
            id: props.clientId,
          })}
        >
          {t('new_quote')}
        </DropdownElement>
        <DropdownElement
          to={route('/credits/create?client=:id', {
            id: props.clientId,
          })}
        >
          {t('new_credit')}
        </DropdownElement>
      </div>
    </Dropdown>
  );
}
