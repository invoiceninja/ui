/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { Client } from 'common/interfaces/client';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Icon } from 'components/icons/Icon';
import { Action } from 'components/ResourceActions';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { BiGitMerge, BiPlusCircle } from 'react-icons/bi';
import { MdCloudCircle, MdPictureAsPdf, MdSend } from 'react-icons/md';

interface Params {
  setIsMergeModalOpen: Dispatch<SetStateAction<boolean>>;
  setMergeFromClientId: Dispatch<SetStateAction<string>>;
}

export function useActions(params: Params) {
  const [t] = useTranslation();

  const handleEmailStatement = (client: Client) => {
    const send = client?.contacts?.some((contact) => contact.email);

    if (!send) {
      return toast.error('client_email_not_set');
    }

    toast.processing();

    request('POST', endpoint('/api/v1/client_statement?send_email=true'), {
      client_id: client.id,
      start_date: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
      show_aging_table: true,
      show_payments_table: true,
      status: 'all',
    })
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };

  const actions: Action<Client>[] = [
    (client: Client) => (
      <DropdownElement
        onClick={() => handleEmailStatement(client)}
        icon={<Icon element={MdSend} />}
      >
        {t('email_statement')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/clients/:id/statement', { id: client.id })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_statement')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        onClick={() => window.open(client.contacts[0].link, '__blank')}
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/invoices/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_invoice')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/payments/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_payment')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/quotes/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_quote')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        to={route('/credits/create?client=:id', { id: client.id })}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_credit')}
      </DropdownElement>
    ),
    (client) => (
      <DropdownElement
        onClick={() => {
          params.setMergeFromClientId(client.id);
          params.setIsMergeModalOpen(true);
        }}
        icon={<Icon element={BiGitMerge} />}
      >
        {t('merge')}
      </DropdownElement>
    ),
  ];

  return actions;
}
