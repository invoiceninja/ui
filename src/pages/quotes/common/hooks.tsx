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
import { QuoteStatus } from '$app/common/enums/quote-status';
import { date, endpoint, getEntityState } from '$app/common/helpers';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Client } from '$app/common/interfaces/client';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Invitation } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Action } from '$app/components/ResourceActions';
import { useAtom, useSetAtom } from 'jotai';
import { openClientPortal } from '$app/pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { invoiceSumAtom, quoteAtom } from './atoms';
import { useApprove } from './hooks/useApprove';
import { useBulkAction } from './hooks/useBulkAction';
import { useMarkSent } from './hooks/useMarkSent';
import { route } from '$app/common/helpers/route';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { QuoteStatus as QuoteStatusBadge } from '../common/components/QuoteStatus';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { EntityStatus } from '$app/components/EntityStatus';
import { useCallback } from 'react';
import { Icon } from '$app/components/icons/Icon';
import {
  MdArchive,
  MdCloudCircle,
  MdControlPointDuplicate,
  MdDelete,
  MdDesignServices,
  MdDone,
  MdDownload,
  MdEdit,
  MdMarkEmailRead,
  MdPictureAsPdf,
  MdPrint,
  MdRestore,
  MdSchedule,
  MdSend,
  MdSwitchRight,
  MdTextSnippet,
} from 'react-icons/md';
import { SelectOption } from '$app/components/datatables/Actions';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Tooltip } from '$app/components/Tooltip';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useScheduleEmailRecord } from '$app/pages/invoices/common/hooks/useScheduleEmailRecord';
import { EntityState } from '$app/common/enums/entity-state';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { isDeleteActionTriggeredAtom } from '$app/pages/invoices/common/components/ProductsTable';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import dayjs from 'dayjs';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { ConvertToProjectBulkAction } from './components/ConvertToProjectBulkAction';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { Assigned } from '$app/components/Assigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { CloneOptionsModal } from './components/CloneOptionsModal';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useDownloadEInvoice } from '$app/pages/invoices/common/hooks/useDownloadEInvoice';

export type ChangeHandler = <T extends keyof Quote>(
  property: T,
  value: Quote[typeof property]
) => void;

interface QuoteUtilitiesProps {
  client?: Client;
}

export function useQuoteUtilities(props: QuoteUtilitiesProps) {
  const currencyResolver = useResolveCurrency();
  const company = useCurrentCompany();

  const [quote, setQuote] = useAtom(quoteAtom);
  const [, setInvoiceSum] = useAtom(invoiceSumAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setQuote((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...quote!.invitations];

    const potential =
      invitations?.find((invitation) => invitation.client_contact_id === id) ||
      -1;

    if (potential !== -1 && checked === false) {
      invitations = invitations.filter((i) => i.client_contact_id !== id);
    }

    if (potential === -1) {
      const invitation: Partial<Invitation> = {
        client_contact_id: id,
      };

      invitations.push(invitation as Invitation);
    }

    handleChange('invitations', invitations);
  };

  const handleLineItemChange = (index: number, lineItem: InvoiceItem) => {
    const lineItems = quote?.line_items || [];

    lineItems[index] = lineItem;

    setQuote((current) => current && { ...current, line_items: lineItems });
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const lineItems = quote?.line_items || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setQuote((current) => current && { ...current, line_items: lineItems });
  };

  const handleCreateLineItem = (typeId: InvoiceItemType) => {
    setQuote(
      (current) =>
        current && {
          ...current,
          line_items: [
            ...current.line_items,
            { ...blankLineItem(), type_id: typeId },
          ],
        }
    );
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = quote?.line_items || [];

    lineItems.splice(index, 1);

    setQuote((quote) => quote && { ...quote, line_items: lineItems });
  };

  const calculateInvoiceSum = (quote: Quote) => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id
    );

    if (currency && quote) {
      const invoiceSum = quote.uses_inclusive_taxes
        ? new InvoiceSumInclusive(quote, currency).build()
        : new InvoiceSum(quote, currency).build();

      setInvoiceSum(invoiceSum);
    }
  };

  return {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  };
}

interface CreateProps {
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setErrors: (validationBag?: ValidationBag) => unknown;
}

export function useCreate(props: CreateProps) {
  const { setErrors, isDefaultTerms, isDefaultFooter } = props;

  const refreshCompanyUsers = useRefreshCompanyUsers();

  const navigate = useNavigate();

  const saveCompany = useHandleCompanySave();

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return async (quote: Quote) => {
    toast.processing();
    setErrors(undefined);

    await saveCompany(true);

    let apiEndpoint = '/api/v1/quotes?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request('POST', endpoint(apiEndpoint), quote)
      .then(async (response: GenericSingleResourceResponse<Quote>) => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('created_quote');

        $refetch(['quotes']);

        navigate(route('/quotes/:id/edit', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}

export function useSave(props: CreateProps) {
  const { setErrors, isDefaultTerms, isDefaultFooter } = props;

  const refreshCompanyUsers = useRefreshCompanyUsers();

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);
  const saveCompany = useHandleCompanySave();

  return async (quote: Quote) => {
    toast.processing();
    setErrors(undefined);

    await saveCompany(true);

    let apiEndpoint = '/api/v1/quotes/:id?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request('PUT', endpoint(apiEndpoint, { id: quote.id }), quote)
      .then(async () => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('updated_quote');

        $refetch(['quotes']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}

interface Params {
  showEditAction?: boolean;
  showCommonBulkAction?: boolean;
}
export function useActions(params?: Params) {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const { isAdmin, isOwner } = useAdmin();

  const setQuote = useSetAtom(quoteAtom);

  const { showCommonBulkAction, showEditAction } = params || {};

  const navigate = useNavigate();
  const downloadPdf = useDownloadPdf({ resource: 'quote' });
  const downloadEQuote = useDownloadEInvoice({
    resource: 'quote',
    downloadType: 'download_e_quote',
  });
  const printPdf = usePrintPdf({ entity: 'quote' });
  const markSent = useMarkSent();
  const approve = useApprove();
  const bulk = useBulkAction();
  const scheduleEmailRecord = useScheduleEmailRecord({ entity: 'quote' });

  const { isEditPage } = useEntityPageIdentifier({ entity: 'quote' });

  const cloneToQuote = (quote: Quote) => {
    setQuote({
      ...quote,
      id: '',
      number: '',
      documents: [],
      date: dayjs().format('YYYY-MM-DD'),
      due_date: '',
      total_taxes: 0,
      exchange_rate: 1,
      last_sent_date: '',
      project_id: '',
      subscription_id: '',
      status_id: '',
      vendor_id: '',
      paid_to_date: 0,
    });

    navigate('/quotes/create?action=clone');
  };

  const { setChangeTemplateResources, setChangeTemplateVisible } =
    useChangeTemplate();

  const actions: Action<Quote>[] = [
    (quote: Quote) =>
      Boolean(showEditAction) && (
        <DropdownElement
          to={route('/quotes/:id/edit', { id: quote.id })}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    () => Boolean(showEditAction) && <Divider withoutPadding />,
    (quote) => (
      <DropdownElement
        to={route('/quotes/:id/pdf', { id: quote.id })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (quote) =>
      getEntityState(quote) !== EntityState.Deleted && (
        <DropdownElement
          onClick={() => printPdf([quote.id])}
          icon={<Icon element={MdPrint} />}
        >
          {t('print_pdf')}
        </DropdownElement>
      ),
    (quote) => (
      <DropdownElement
        onClick={() => downloadPdf(quote)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_pdf')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => downloadEQuote(quote)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_e_quote')}
      </DropdownElement>
    ),
    (quote) =>
      quote.status_id !== QuoteStatus.Converted &&
      quote.status_id !== QuoteStatus.Approved &&
      (isAdmin || isOwner) && (
        <DropdownElement
          onClick={() => scheduleEmailRecord(quote.id)}
          icon={<Icon element={MdSchedule} />}
        >
          {t('schedule')}
        </DropdownElement>
      ),
    (quote) => (
      <DropdownElement
        to={route('/quotes/:id/email', { id: quote.id })}
        icon={<Icon element={MdSend} />}
      >
        {t('email_quote')}
      </DropdownElement>
    ),
    (quote) => (
      <DropdownElement
        onClick={() => quote && openClientPortal(quote)}
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    (quote) =>
      quote.status_id === QuoteStatus.Draft && (
        <DropdownElement
          onClick={() => markSent(quote)}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (quote) =>
      (quote.status_id === QuoteStatus.Draft ||
        quote.status_id === QuoteStatus.Sent) && (
        <DropdownElement
          onClick={() => approve(quote)}
          icon={<Icon element={MdDone} />}
        >
          {t('approve')}
        </DropdownElement>
      ),
    (quote) =>
      quote.status_id !== QuoteStatus.Converted &&
      hasPermission('create_invoice') && (
        <DropdownElement
          onClick={() => bulk([quote.id], 'convert_to_invoice')}
          icon={<Icon element={MdSwitchRight} />}
        >
          {t('convert_to_invoice')}
        </DropdownElement>
      ),
    (quote) =>
      !quote.project_id &&
      hasPermission('create_project') && (
        <ConvertToProjectBulkAction selectedIds={[quote.id]} />
      ),
    (quote) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([quote]);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (quote) =>
      hasPermission('create_quote') && (
        <DropdownElement
          onClick={() => cloneToQuote(quote)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone_to_quote')}
        </DropdownElement>
      ),
    (quote) => <CloneOptionsModal quote={quote} />,
    () =>
      (isEditPage || Boolean(showCommonBulkAction)) && (
        <Divider withoutPadding />
      ),
    (quote) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      quote.archived_at === 0 && (
        <DropdownElement
          onClick={() => bulk([quote.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (quote) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      quote.archived_at > 0 && (
        <DropdownElement
          onClick={() => bulk([quote.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (quote) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      !quote?.is_deleted && (
        <DropdownElement
          onClick={() => bulk([quote.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

export const defaultColumns: string[] = [
  'status',
  'number',
  'client',
  'amount',
  'date',
  'valid_until',
];

export function useAllQuoteColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const quoteColumns = [
    'status',
    'number',
    'client',
    'amount',
    'date',
    'valid_until',
    'archived_at',
    // 'assigned_to',  @Todo: Need to fetch the relationship
    'client_city',
    'client_country',
    'client_postal_code',
    'client_state',
    'contact_email',
    'contact_name',
    'created_at',
    // 'created_by', @Todo: Need to resolve relationship
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'discount',
    'documents',
    'entity_state',
    'exchange_rate',
    'is_deleted',
    'is_viewed',
    'last_sent_date',
    'partial',
    'partial_due_date',
    'po_number',
    'private_notes',
    // 'project', @Todo: Need to resolve relationship
    'public_notes',
    'tax_amount',
    'updated_at',
    // 'vendor', @Todo: Need to resolve relationship
  ] as const;

  return quoteColumns;
}

export function useQuoteColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const quoteColumns = useAllQuoteColumns();
  type QuoteColumns = (typeof quoteColumns)[number];

  const accentColor = useAccentColor();
  const navigate = useNavigate();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const resolveCountry = useResolveCountry();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const quoteViewedAt = useCallback((quote: Quote) => {
    let viewed = '';

    quote.invitations.map((invitation) => {
      if (invitation.viewed_date) {
        viewed = invitation.viewed_date;
      }
    });

    return viewed;
  }, []);

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const columns: DataTableColumnsExtended<Quote, QuoteColumns> = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, quote) => (
        <div className="flex items-center space-x-2">
          <QuoteStatusBadge entity={quote} />

          {quote.status_id === QuoteStatus.Converted && quote.invoice_id && (
            <Assigned
              entityId={quote.invoice_id}
              cacheEndpoint="/api/v1/invoices"
              apiEndpoint="/api/v1/invoices/:id?include=client.group_settings"
              preCheck={
                hasPermission('view_invoice') || hasPermission('edit_invoice')
              }
              component={
                <MdTextSnippet
                  className="cursor-pointer"
                  fontSize={19}
                  color={accentColor}
                  onClick={() =>
                    navigate(
                      route('/invoices/:id/edit', { id: quote.invoice_id })
                    )
                  }
                />
              }
            />
          )}
        </div>
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (field, quote) => (
        <DynamicLink
          to={route('/quotes/:id/edit', { id: quote.id })}
          renderSpan={disableNavigation('quote', quote)}
        >
          {field}
        </DynamicLink>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (_, quote) => (
        <DynamicLink
          to={route('/clients/:id', { id: quote.client_id })}
          renderSpan={disableNavigation('client', quote.client)}
        >
          {quote.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id,
          quote.client?.settings.currency_id
        ),
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'valid_until',
      id: 'due_date',
      label: t('valid_until'),
      format: (value, quote) => date(quote.due_date, dateFormat),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'client_city',
      id: 'client_id',
      label: t('client_city'),
      format: (value, quote) => quote.client?.city,
    },
    {
      column: 'client_country',
      id: 'client_id',
      label: t('client_country'),
      format: (value, quote) =>
        quote.client?.country_id &&
        resolveCountry(quote.client?.country_id)?.name,
    },
    {
      column: 'client_postal_code',
      id: 'client_id',
      label: t('client_postal_code'),
      format: (value, quote) => quote.client?.postal_code,
    },
    {
      column: 'client_state',
      id: 'client_id',
      label: t('client_state'),
      format: (value, quote) => quote.client?.state,
    },
    {
      column: 'contact_email',
      id: 'client_id',
      label: t('contact_email'),
      format: (value, quote) =>
        quote.client &&
        quote.client.contacts.length > 0 && (
          <CopyToClipboard text={quote.client?.contacts[0].email} />
        ),
    },
    {
      column: 'contact_name',
      id: 'client_id',
      label: t('contact_name'),
      format: (value, quote) =>
        quote.client &&
        quote.client.contacts.length > 0 &&
        `${quote.client?.contacts[0].first_name} ${quote.client?.contacts[0].last_name}`,
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
      format: (value) => formatCustomFieldValue('invoice1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('invoice2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('invoice3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('invoice4', value?.toString()),
    },
    {
      column: 'discount',
      id: 'discount',
      label: t('discount'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id,
          quote.client?.settings.currency_id
        ),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, quote) => quote.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, quote) => <EntityStatus entity={quote} />,
    },
    {
      column: 'exchange_rate',
      id: 'exchange_rate',
      label: t('exchange_rate'),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, quote) => (quote.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'is_viewed',
      id: 'id',
      label: t('is_viewed'),
      format: (value, quote) =>
        quoteViewedAt(quote).length > 0
          ? date(quoteViewedAt(quote), dateFormat)
          : t('no'),
    },
    {
      column: 'last_sent_date',
      id: 'last_sent_date',
      label: t('last_sent_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'partial',
      id: 'partial',
      label: t('partial'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id,
          quote.client?.settings.currency_id
        ),
    },
    {
      column: 'partial_due_date',
      id: 'partial_due_date',
      label: t('partial_due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'po_number',
      id: 'po_number',
      label: t('po_number'),
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span
            dangerouslySetInnerHTML={{ __html: (value as string).slice(0, 50) }}
          />
        </Tooltip>
      ),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span
            dangerouslySetInnerHTML={{ __html: (value as string).slice(0, 50) }}
          />
        </Tooltip>
      ),
    },
    {
      column: 'tax_amount',
      id: 'total_taxes',
      label: t('total_taxes'),
      format: (value, quote) =>
        formatMoney(
          value,
          quote.client?.country_id,
          quote.client?.settings.currency_id
        ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('last_updated'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.quote || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useQuoteFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('draft'),
      value: 'draft',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('sent'),
      value: 'sent',
      color: 'white',
      backgroundColor: '#93C5FD',
    },
    {
      label: t('approved'),
      value: 'approved',
      color: 'white',
      backgroundColor: '#1D4ED8',
    },
    {
      label: t('expired'),
      value: 'expired',
      color: 'white',
      backgroundColor: '#DC2626',
    },
    {
      label: t('upcoming'),
      value: 'upcoming',
      color: 'white',
      backgroundColor: '#e6b05c',
    },
    {
      label: t('converted'),
      value: 'converted',
      color: 'white',
      backgroundColor: '#22C55E',
    },
  ];

  return filters;
}
