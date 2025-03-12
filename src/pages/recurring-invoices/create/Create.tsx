/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankInvitation } from '$app/common/constants/blank-invitation';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default, SaveOption } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router-dom';
import { invoiceSumAtom, recurringInvoiceAtom } from '../common/atoms';
import { useCreate, useRecurringInvoiceUtilities } from '../common/hooks';
import { useBlankRecurringInvoiceQuery } from '../common/queries';
import { Icon } from '$app/components/icons/Icon';
import { MdNotStarted, MdSend } from 'react-icons/md';
import dayjs from 'dayjs';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from '../common/components/ConfirmActionModal';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { Tab, Tabs } from '$app/components/Tabs';

export interface RecurringInvoiceContext {
  recurringInvoice: RecurringInvoice | undefined;
  setRecurringInvoice: Dispatch<SetStateAction<RecurringInvoice | undefined>>;
  errors: ValidationBag | undefined;
  client: Client | undefined;
  invoiceSum: InvoiceSum | InvoiceSumInclusive | undefined;
}

export default function Create() {
  const { documentTitle } = useTitle('new_recurring_invoice');
  const [t] = useTranslation();

  const [searchParams] = useSearchParams();

  const [invoiceSum] = useAtom(invoiceSumAtom);
  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);

  const { data, isLoading } = useBlankRecurringInvoiceQuery({
    enabled: typeof recurringInvoice === 'undefined',
  });

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('new_recurring_invoice'),
      href: '/recurring_invoices/create',
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('create'),
      href: '/recurring_invoices/create',
    },
    {
      name: t('documents'),
      href: '/recurring_invoices/create/documents',
    },
    {
      name: t('settings'),
      href: '/recurring_invoices/create/settings',
    },
  ];

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const company = useCurrentCompany();
  const save = useCreate({ setErrors });
  const clientResolver = useClientResolver();

  const { handleChange, calculateInvoiceSum } = useRecurringInvoiceUtilities({
    client,
  });

  const settingResolver = (client: Client, taxNumber: '1' | '2' | '3') => {
    if (client?.settings?.[`tax_name${taxNumber}`]) {
      return {
        name: client.settings[`tax_name${taxNumber}`],
        rate: client.settings[`tax_rate${taxNumber}`],
      };
    }

    if (client?.group_settings?.settings?.[`tax_name${taxNumber}`]) {
      return {
        name: client?.group_settings?.settings[`tax_name${taxNumber}`],
        rate: client?.group_settings?.settings[`tax_rate${taxNumber}`],
      };
    }

    return {
      name: company?.settings[`tax_name${taxNumber}`],
      rate: company?.settings[`tax_rate${taxNumber}`],
    };
  };

  useEffect(() => {
    setRecurringInvoice((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _recurringInvoice = cloneDeep(data);

        if (typeof _recurringInvoice.line_items === 'string') {
          _recurringInvoice.line_items = [];
        }

        if (searchParams.get('client')) {
          _recurringInvoice.client_id = searchParams.get('client')!;
        }

        if (_recurringInvoice.next_send_date === '') {
          _recurringInvoice.next_send_date = dayjs().format('YYYY-MM-DD');
        }

        _recurringInvoice.uses_inclusive_taxes =
          company?.settings?.inclusive_taxes ?? false;

        _recurringInvoice.auto_bill = company?.settings?.auto_bill ?? 'off';

        value = _recurringInvoice;
      }

      return value;
    });

    return () => {
      setRecurringInvoice(undefined);
    };
  }, [data]);

  useEffect(() => {
    recurringInvoice && calculateInvoiceSum(recurringInvoice);
  }, [recurringInvoice]);

  useEffect(() => {
    recurringInvoice &&
      recurringInvoice.client_id.length > 1 &&
      clientResolver.find(recurringInvoice.client_id).then((client) => {
        setClient(client);

        const invitations: Record<string, unknown>[] = [];

        client.contacts.map((contact) => {
          if (contact.send_email) {
            const invitation = cloneDeep(blankInvitation);

            invitation.client_contact_id = contact.id;
            invitations.push(invitation);
          }
        });

        handleChange('invitations', invitations);

        if (!client.is_tax_exempt) {
          if (
            company &&
            company.enabled_tax_rates > 0 &&
            searchParams.get('action') !== 'clone'
          ) {
            const { name, rate } = settingResolver(client, '1');

            handleChange('tax_name1', name);
            handleChange('tax_rate1', rate);
          }

          if (
            company &&
            company.enabled_tax_rates > 1 &&
            searchParams.get('action') !== 'clone'
          ) {
            const { name, rate } = settingResolver(client, '2');

            handleChange('tax_name2', name);
            handleChange('tax_rate2', rate);
          }

          if (
            company &&
            company.enabled_tax_rates > 2 &&
            searchParams.get('action') !== 'clone'
          ) {
            const { name, rate } = settingResolver(client, '3');

            handleChange('tax_name3', name);
            handleChange('tax_rate3', rate);
          }
        }
      });
  }, [recurringInvoice?.client_id]);

  const [, setIsConfirmationVisible] = useAtom(confirmActionModalAtom);

  const saveOptions: SaveOption[] = [
    {
      onClick: () => setIsConfirmationVisible(true),
      label: t('send_now'),
      icon: <Icon element={MdSend} />,
    },
    {
      onClick: () => save(recurringInvoice as RecurringInvoice, 'start'),
      label: t('start'),
      icon: <Icon element={MdNotStarted} />,
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!recurringInvoice?.client_id}
      onSaveClick={() => save(recurringInvoice as RecurringInvoice)}
      additionalSaveOptions={saveOptions}
    >
      {!isLoading ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

          <Outlet
            context={{
              recurringInvoice,
              setRecurringInvoice,
              errors,
              client,
              invoiceSum,
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      <ConfirmActionModal
        onClick={() => save(recurringInvoice as RecurringInvoice, 'send_now')}
      />
    </Default>
  );
}
