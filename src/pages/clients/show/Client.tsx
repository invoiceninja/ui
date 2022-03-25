/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { bulk, useClientQuery } from 'common/queries/clients';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { Tabs } from 'components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Tab } from 'components/Tabs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';
import { Standing } from './components/Standing';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { DropdownElement } from 'components/dropdown/DropdownElement';

export function Client() {
  const { documentTitle, setDocumentTitle } = useTitle('view_client');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: client, isLoading } = useClientQuery({ id });
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);
  useEffect(() => {
    setDocumentTitle(client?.data?.data?.display_name || 'view_client');
  }, [client]);

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: generatePath('/clients/:id', { id }),
    },
  ];

  const tabs: Tab[] = [
    { name: t('invoices'), href: generatePath('/clients/:id', { id }) },
    { name: t('quotes'), href: generatePath('/clients/:id/quotes', { id }) },
    {
      name: t('payments'),
      href: generatePath('/clients/:id/payments', { id }),
    },
    {
      name: t('recurring_invoices'),
      href: generatePath('/clients/:id/recurring_invoices', { id }),
    },
    {
      name: t('credits'),
      href: generatePath('/clients/:id/credits', { id }),
    },
    {
      name: t('projects'),
      href: generatePath('/clients/:id/projects', { id }),
    },
    {
      name: t('tasks'),
      href: generatePath('/clients/:id/tasks', { id }),
    },
    {
      name: t('expenses'),
      href: generatePath('/clients/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: generatePath('/clients/:id/recurring_expenses', { id }),
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSave = (password: string, passwordIsRequired: boolean) => {
    const toastId = toast.loading(t('processing'));
    if (password == '') {
      toast.dismiss();
      toast.error(t('password_error_incorrect'));
      return 1;
    }
    axios
      .post(
        endpoint('/api/v1/clients/:id/purge', { id: client?.data.data.id }),
        {},
        {
          headers: { 'X-Api-Password': password, ...defaultHeaders },
        }
      )
      .then(() => {
        toast.success(t('purged_client'), { id: toastId });
        navigate('/clients');
      })
      .catch((error: AxiosError | unknown) => {
        console.error(error);

        toast.dismiss();
        toast.error(t('error_title'));
      })
      .finally(() => {});
  };
  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <div className="inline-flex items-center space-x-2">
          <Button to={generatePath('/clients/:id/edit', { id })}>
            {t('edit_client')}
          </Button>

          <Dropdown className="divide-y" label={t('more_actions')}>
            <DropdownElement
              key={'archive'}
              onClick={() => {
                const toastId = toast.loading(t('processing'));

                bulk([client?.data.data.id], 'archive')
                  .then(() => {
                    toast.success(t('archived_client'), { id: toastId });
                  })
                  .catch((error: AxiosError | unknown) => {
                    console.error(error);

                    toast.dismiss();
                    toast.error(t('error_title'));
                  });
              }}
            >
              {t('archive')}
            </DropdownElement>
            <DropdownElement
              key={'delete'}
              onClick={() => {
                const toastId = toast.loading(t('processing'));

                bulk([client?.data.data.id], 'delete')
                  .then(() => {
                    toast.success(t('deleted_client'), { id: toastId });
                  })
                  .catch((error: AxiosError | unknown) => {
                    console.error(error);

                    toast.dismiss();
                    toast.error(t('error_title'));
                  });
              }}
            >
              {t('delete')}
            </DropdownElement>
            <DropdownElement
              key={'purge'}
              onClick={() => {
                setPasswordConfirmModalOpen(true);
              }}
            >
              {t('purge')}
            </DropdownElement>
          </Dropdown>
        </div>
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
            <Details />
            <Address />
            <Contacts />
            <Standing />
          </div>

          <Tabs tabs={tabs} className="mt-6" />

          <div className="my-4">
            <Outlet />
          </div>
        </>
      )}
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={onSave}
      />
    </Default>
  );
}
