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
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router-dom';
import { creditAtom, invoiceSumAtom } from '../common/atoms';
import { useCreate, useCreditUtilities } from '../common/hooks';
import { useBlankCreditQuery } from '../common/queries';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { Credit } from '$app/common/interfaces/credit';
import { Tab, Tabs } from '$app/components/Tabs';
import { useAtomWithPrevent } from '$app/common/hooks/useAtomWithPrevent';

export interface CreditsContext {
  credit: Credit | undefined;
  setCredit: Dispatch<SetStateAction<Credit | undefined>>;
  isDefaultFooter: boolean;
  isDefaultTerms: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  client: Client | undefined;
  invoiceSum: InvoiceSum | InvoiceSumInclusive | undefined;
}

export default function Create() {
  const { documentTitle } = useTitle('new_credit');
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const pages: Page[] = [
    { name: t('credits'), href: '/credits' },
    {
      name: t('new_credit'),
      href: '/credits/create',
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('create'),
      href: '/credits/create',
    },
    {
      name: t('documents'),
      href: '/credits/create/documents',
    },
    {
      name: t('settings'),
      href: '/credits/create/settings',
    },
  ];

  const [searchParams] = useSearchParams();

  const [credit, setCredit] = useAtomWithPrevent(creditAtom);
  const [invoiceSum, setInvoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const clientResolver = useClientResolver();

  const { data, isLoading } = useBlankCreditQuery({
    enabled: typeof credit === 'undefined',
  });

  const { handleChange, calculateInvoiceSum } = useCreditUtilities({
    client,
  });

  const save = useCreate({ setErrors, isDefaultFooter, isDefaultTerms });

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
    setInvoiceSum(undefined);

    setCredit((current) => {
      let value = current;

      if (
        searchParams.get('action') !== 'clone' &&
        searchParams.get('action') !== 'reverse'
      ) {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone' &&
        searchParams.get('action') !== 'reverse'
      ) {
        const _credit = cloneDeep(data);

        if (typeof _credit.line_items === 'string') {
          _credit.line_items = [];
        }

        if (searchParams.get('client')) {
          _credit.client_id = searchParams.get('client')!;
        }

        _credit.uses_inclusive_taxes =
          company?.settings?.inclusive_taxes ?? false;

        value = _credit;
      }

      return value;
    });

    return () => {
      setCredit(undefined);
    };
  }, [data]);

  useEffect(() => {
    credit &&
      credit.client_id.length > 1 &&
      clientResolver.find(credit.client_id).then((client) => {
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
  }, [credit?.client_id]);

  useEffect(() => {
    credit && calculateInvoiceSum(credit);
  }, [credit]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => save(credit!)}
      disableSaveButton={credit?.client_id.length === 0}
    >
      {!isLoading ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

          <Outlet
            context={{
              credit,
              setCredit,
              errors,
              isDefaultTerms,
              setIsDefaultTerms,
              isDefaultFooter,
              setIsDefaultFooter,
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
    </Default>
  );
}
