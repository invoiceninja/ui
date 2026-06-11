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
import { Invoice } from '$app/common/interfaces/invoice';
import { Invitation } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankInvoiceQuery } from '$app/common/queries/invoices';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { QuickbooksDepositDisabledAlert } from '$app/components/QuickbooksDepositDisabledAlert';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router-dom';
import { invoiceAtom, invoiceSumAtom } from '../common/atoms';
import {
  clientDraftAtom,
  isClientDraftDirty,
} from '../common/atoms/client-draft';
import { useCreateClientFromDraft, ClientCreationValidationError } from '../common/hooks/useCreateClientFromDraft';
import { useHandleCreate } from './hooks/useHandleCreate';
import { useInvoiceUtilities } from './hooks/useInvoiceUtilities';
import { Tab, Tabs } from '$app/components/Tabs';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { AddUninvoicedItemsButton } from '../common/components/AddUninvoicedItemsButton';
import { useAtomWithPrevent } from '$app/common/hooks/useAtomWithPrevent';
import { useSaveKeyboardShortcut } from '$app/common/hooks/useSaveKeyboardShortcut';

export type ChangeHandler = <T extends keyof Invoice>(
  property: T,
  value: Invoice[typeof property]
) => void;

export interface CreateInvoiceContext {
  invoice: Invoice | undefined;
  setInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  client: Client | undefined;
  invoiceSum: InvoiceSum | InvoiceSumInclusive | undefined;
  clientCreationErrors: ValidationBag | undefined;
}

export default function Create() {
  const { t } = useTranslation();
  const { documentTitle } = useTitle('new_invoice');

  const [invoice, setInvoice] = useAtomWithPrevent(invoiceAtom);

  const { data, isLoading } = useBlankInvoiceQuery({
    enabled: typeof invoice === 'undefined',
  });

  const clientResolver = useClientResolver();
  const company = useCurrentCompany();

  const [invoiceSum, setInvoiceSum] = useAtom(invoiceSumAtom);

  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState<ValidationBag>();
  const [client, setClient] = useState<Client | undefined>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);
  const [clientCreationErrors, setClientCreationErrors] =
    useState<ValidationBag>();

  const clientDraft = useAtomValue(clientDraftAtom);
  const setClientDraft = useSetAtom(clientDraftAtom);
  const createClientFromDraft = useCreateClientFromDraft();

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('new_invoice'),
      href: '/invoices/create',
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('create'),
      href: '/invoices/create',
    },
    {
      name: t('documents'),
      href: '/invoices/create/documents',
    },
    {
      name: t('settings'),
      href: '/invoices/create/settings',
    },
  ];

  const { handleChange, calculateInvoiceSum } = useInvoiceUtilities({ client });

  const save = useHandleCreate({
    setErrors,
    isDefaultTerms,
    isDefaultFooter,
    isFormBusy,
    setIsFormBusy,
  });

  const saveWithClientFlow = useCallback(
    async (target: Invoice) => {
      if (target.client_id || !isClientDraftDirty(clientDraft)) {
        return save(target);
      }
      if (isFormBusy) return;

      setIsFormBusy(true);
      setClientCreationErrors(undefined);
      toast.processing();

      try {
        const createdClient = await createClientFromDraft(clientDraft!);

        const invitations: Invitation[] = createdClient.contacts
          .filter((contact) => contact.send_email)
          .map((contact) => {
            const invitation = cloneDeep(
              blankInvitation
            ) as unknown as Invitation;
            invitation.client_contact_id = contact.id;
            invitation.can_sign = contact.can_sign;
            return invitation;
          });

        const next: Invoice = {
          ...target,
          client_id: createdClient.id,
          invitations,
        };

        setInvoice(next);
        setClientDraft(null);
        setIsFormBusy(false);
        return save(next);
      } catch (error) {
        setIsFormBusy(false);
        if (error instanceof ClientCreationValidationError) {
          setClientCreationErrors(error.errors);
          toast.dismiss();
          return;
        }
        toast.error();
        throw error;
      }
    },
    [
      clientDraft,
      isFormBusy,
      createClientFromDraft,
      save,
      setInvoice,
      setClientDraft,
    ]
  );

  useEffect(() => {
    setInvoiceSum(undefined);

    setInvoice((current) => {
      let value = current;

      if (
        searchParams.get('action') !== 'clone' &&
        searchParams.get('action') !== 'invoice_project' &&
        searchParams.get('action') !== 'invoice_task' &&
        searchParams.get('action') !== 'invoice_expense' &&
        searchParams.get('action') !== 'invoice_product' &&
        searchParams.get('action') !== 'invoice_transaction'
      ) {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _invoice = cloneDeep(data);

        if (typeof _invoice.line_items === 'string') {
          _invoice.line_items = [];
        }

        if (searchParams.get('client')) {
          _invoice.client_id = searchParams.get('client')!;
        }

        _invoice.uses_inclusive_taxes =
          company?.settings?.inclusive_taxes ?? false;

        value = _invoice;
      }

      return value;
    });

    return () => {
      if (
        searchParams.get('action') !== 'clone' &&
        searchParams.get('action') !== 'invoice_project' &&
        searchParams.get('action') !== 'invoice_task' &&
        searchParams.get('action') !== 'invoice_expense' &&
        searchParams.get('action') !== 'invoice_product' &&
        searchParams.get('action') !== 'invoice_transaction'
      ) {
        setInvoice(undefined);
      }
    };
  }, [data]);

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
    invoice &&
      invoice.client_id.length > 1 &&
      clientResolver.find(invoice.client_id).then((client) => {
        setClient(client);

        const invitations: Invitation[] = [];

        client.contacts.map((contact) => {
          if (contact.send_email) {
            const invitation = cloneDeep(
              blankInvitation
            ) as unknown as Invitation;

            invitation.client_contact_id = contact.id;
            invitation.can_sign = contact.can_sign; // Set can_sign based on send_email
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
  }, [invoice?.client_id]);

  useEffect(() => {
    invoice && calculateInvoiceSum(invoice);
  }, [invoice]);

  const canSave = Boolean(
    invoice &&
      !isFormBusy &&
      (invoice.client_id.length > 0 || isClientDraftDirty(clientDraft))
  );

  useSaveKeyboardShortcut({
    isEnabled: canSave,
    onSave: () => saveWithClientFlow(invoice as Invoice),
  });

  return (
    <>
      <Default
        title={documentTitle}
        breadcrumbs={pages}
        onSaveClick={() => saveWithClientFlow(invoice as Invoice)}
        disableSaveButton={!canSave}
        aboveMainContainer={
          invoice && <QuickbooksDepositDisabledAlert resource={invoice} />
        }
      >
        {!isLoading ? (
          <div className="space-y-4">
            <Tabs tabs={tabs} />

            <Outlet
              context={{
                invoice,
                setInvoice,
                errors,
                isDefaultTerms,
                setIsDefaultTerms,
                isDefaultFooter,
                setIsDefaultFooter,
                client,
                invoiceSum,
                clientCreationErrors,
              }}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </Default>

      <AddUninvoicedItemsButton invoice={invoice} setInvoice={setInvoice} />
    </>
  );
}
