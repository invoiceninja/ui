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
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { CreditStatus } from '$app/common/enums/credit-status';
import { date, endpoint, getEntityState } from '$app/common/helpers';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Client } from '$app/common/interfaces/client';
import { Credit } from '$app/common/interfaces/credit';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Invitation } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Divider } from '$app/components/cards/Divider';
import { Action } from '$app/components/ResourceActions';
import { useAtom, useSetAtom } from 'jotai';
import { openClientPortal } from '$app/pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from '$app/pages/invoices/common/hooks/useDownloadPdf';
import {
  DataTableColumnsExtended,
  resourceViewedAt,
} from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { creditAtom, invoiceSumAtom } from './atoms';
import { useMarkSent } from './hooks/useMarkSent';
import { CreditStatus as CreditStatusBadge } from '../common/components/CreditStatus';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { EntityStatus } from '$app/components/EntityStatus';
import {
  MdArchive,
  MdCloudCircle,
  MdComment,
  MdControlPointDuplicate,
  MdCreditScore,
  MdDelete,
  MdDesignServices,
  MdDownload,
  MdMarkEmailRead,
  MdPaid,
  MdPictureAsPdf,
  MdPrint,
  MdRestore,
  MdSchedule,
  MdSend,
} from 'react-icons/md';
import { Tooltip } from '$app/components/Tooltip';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useScheduleEmailRecord } from '$app/pages/invoices/common/hooks/useScheduleEmailRecord';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { EntityState } from '$app/common/enums/entity-state';
import { isDeleteActionTriggeredAtom } from '$app/pages/invoices/common/components/ProductsTable';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import dayjs from 'dayjs';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { useMarkPaid } from './hooks/useMarkPaid';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { useBulk } from '$app/common/queries/credits';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { CloneOptionsModal } from './components/CloneOptionsModal';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useDownloadEInvoice } from '$app/pages/invoices/common/hooks/useDownloadEInvoice';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import {
  extractTextFromHTML,
  sanitizeHTML,
} from '$app/common/helpers/html-string';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { AddActivityComment } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { EntityActionElement } from '$app/components/EntityActionElement';
import classNames from 'classnames';

interface CreditUtilitiesProps {
  client?: Client;
}

export type ChangeHandler = <T extends keyof Credit>(
  property: T,
  value: Credit[typeof property]
) => void;

export function useCreditUtilities(props: CreditUtilitiesProps) {
  const currencyResolver = useResolveCurrency();
  const company = useCurrentCompany();

  const [credit, setCredit] = useAtom(creditAtom);
  const [, setInvoiceSum] = useAtom(invoiceSumAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setCredit((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...credit!.invitations];

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
    const lineItems = credit?.line_items || [];

    lineItems[index] = lineItem;

    setCredit((current) => current && { ...current, line_items: lineItems });
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const lineItems = credit?.line_items || [];

    if (lineItems[index][key] === value) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setCredit((current) => current && { ...current, line_items: lineItems });
  };

  const handleCreateLineItem = () => {
    setCredit(
      (current) =>
        current && {
          ...current,
          line_items: [
            ...current.line_items,
            {
              ...blankLineItem(),
              type_id: InvoiceItemType.Product,
              quantity: 1,
            },
          ],
        }
    );
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = credit?.line_items || [];

    lineItems.splice(index, 1);

    setCredit((current) => current && { ...current, line_items: lineItems });
  };

  const calculateInvoiceSum = (credit: Credit) => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id
    );

    if (currency && credit) {
      const invoiceSum = credit.uses_inclusive_taxes
        ? new InvoiceSumInclusive(credit, currency).build()
        : new InvoiceSum(credit, currency).build();

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
  const { setErrors, isDefaultFooter, isDefaultTerms } = props;

  const navigate = useNavigate();

  const saveCompany = useHandleCompanySave();
  const refreshCompanyUsers = useRefreshCompanyUsers();
  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return async (credit: Credit) => {
    toast.processing();
    setErrors(undefined);

    await saveCompany({ excludeToasters: true });

    let apiEndpoint = '/api/v1/credits?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request('POST', endpoint(apiEndpoint), credit)
      .then(async (response: GenericSingleResourceResponse<Credit>) => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('created_credit');

        $refetch(['credits']);

        navigate(route('/credits/:id/edit', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          const errorMessages = error.response.data;

          if (errorMessages.errors.amount || errorMessages.errors.invoice_id) {
            toast.error(
              errorMessages.errors.amount[0] ||
                errorMessages.errors.invoice_id[0]
            );
          } else {
            toast.dismiss();
          }

          setErrors(errorMessages);
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}

export function useSave(props: CreateProps) {
  const { setErrors, isDefaultFooter, isDefaultTerms } = props;

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  const refreshCompanyUsers = useRefreshCompanyUsers();
  const saveCompany = useHandleCompanySave();

  return async (credit: Credit) => {
    toast.processing();

    setErrors(undefined);

    await saveCompany({ excludeToasters: true });

    let apiEndpoint = '/api/v1/credits/:id?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request('PUT', endpoint(apiEndpoint, { id: credit.id }), credit)
      .then(async () => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('updated_credit');

        $refetch(['credits']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          const errorMessages = error.response.data;

          if (errorMessages.errors.amount) {
            toast.error(errorMessages.errors.amount[0]);
          } else {
            toast.dismiss();
          }

          setErrors(errorMessages);
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}

interface Params {
  dropdown?: boolean;
}

export function useActions(params?: Params) {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const hasPermission = useHasPermission();

  const { dropdown = true } = params || {};

  const company = useCurrentCompany();
  const { isAdmin, isOwner } = useAdmin();
  const { isEditPage } = useEntityPageIdentifier({
    entity: 'credit',
    editPageTabs: ['documents', 'settings', 'activity', 'history'],
  });

  const setCredit = useSetAtom(creditAtom);

  const bulk = useBulk();
  const markSent = useMarkSent();
  const markPaid = useMarkPaid();
  const printPdf = usePrintPdf({ entity: 'credit' });
  const downloadPdf = useDownloadPdf({ resource: 'credit' });
  const scheduleEmailRecord = useScheduleEmailRecord({ entity: 'credit' });
  const downloadECredit = useDownloadEInvoice({
    resource: 'credit',
    downloadType: 'download_e_credit',
  });
  const {
    setChangeTemplateResources,
    setChangeTemplateVisible,
    setChangeTemplateEntityContext,
  } = useChangeTemplate();

  const cloneToCredit = (credit: Credit) => {
    setCredit({
      ...credit,
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
      po_number: '',
    });

    navigate('/credits/create?action=clone');
  };

  const actions: Action<Credit>[] = [
    (credit) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'view_pdf',
        })}
        entity="credit"
        actionKey="view_pdf"
        isCommonActionSection={!dropdown}
        tooltipText={t('view_pdf')}
        to={route('/credits/:id/pdf', { id: credit.id })}
        icon={MdPictureAsPdf}
      >
        {t('view_pdf')}
      </EntityActionElement>
    ),
    (credit) =>
      getEntityState(credit) !== EntityState.Deleted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'print_pdf',
          })}
          entity="credit"
          actionKey="print_pdf"
          isCommonActionSection={!dropdown}
          tooltipText={t('print_pdf')}
          onClick={() => printPdf([credit.id])}
          icon={MdPrint}
          disablePreventNavigation
        >
          {t('print_pdf')}
        </EntityActionElement>
      ),
    (credit) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'download_pdf',
        })}
        entity="credit"
        actionKey="download_pdf"
        isCommonActionSection={!dropdown}
        tooltipText={t('download_pdf')}
        onClick={() => downloadPdf(credit)}
        icon={MdDownload}
        disablePreventNavigation
      >
        {t('download_pdf')}
      </EntityActionElement>
    ),
    (credit) =>
      Boolean(company?.settings.enable_e_invoice) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'download_e_credit',
          })}
          entity="credit"
          actionKey="download_e_credit"
          isCommonActionSection={!dropdown}
          tooltipText={t('download_e_credit')}
          onClick={() => downloadECredit(credit)}
          icon={MdDownload}
          disablePreventNavigation
        >
          {t('download_e_credit')}
        </EntityActionElement>
      ),
    (credit) =>
      (isAdmin || isOwner) && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'schedule',
          })}
          entity="credit"
          actionKey="schedule"
          isCommonActionSection={!dropdown}
          tooltipText={t('schedule')}
          onClick={() => scheduleEmailRecord(credit.id)}
          icon={MdSchedule}
        >
          {t('schedule')}
        </EntityActionElement>
      ),
    (credit) => (
      <AddActivityComment
        {...(!dropdown && {
          key: 'add_comment',
        })}
        entity="credit"
        entityId={credit.id}
        label={`#${credit.number}`}
        labelElement={
          <EntityActionElement
            entity="credit"
            actionKey="add_comment"
            isCommonActionSection={!dropdown}
            tooltipText={t('add_comment')}
            icon={MdComment}
            disablePreventNavigation
          >
            {t('add_comment')}
          </EntityActionElement>
        }
      />
    ),
    (credit) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'email_credit',
        })}
        entity="credit"
        actionKey="email_credit"
        isCommonActionSection={!dropdown}
        tooltipText={t('email_credit')}
        to={route('/credits/:id/email', { id: credit.id })}
        icon={MdSend}
      >
        {t('email_credit')}
      </EntityActionElement>
    ),
    (credit) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'client_portal',
        })}
        entity="credit"
        actionKey="client_portal"
        isCommonActionSection={!dropdown}
        tooltipText={t('client_portal')}
        onClick={() => credit && openClientPortal(credit)}
        icon={MdCloudCircle}
        disablePreventNavigation
      >
        {t('client_portal')}
      </EntityActionElement>
    ),
    (credit) =>
      credit.client_id &&
      credit.amount > 0 &&
      hasPermission('create_payment') && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'apply_credit',
          })}
          entity="credit"
          actionKey="apply_credit"
          isCommonActionSection={!dropdown}
          tooltipText={t('apply_credit')}
          to={route(
            '/payments/create?client=:clientId&credit=:creditId&type=1',
            { clientId: credit.client_id, creditId: credit.id }
          )}
          icon={MdCreditScore}
        >
          {t('apply_credit')}
        </EntityActionElement>
      ),
    (credit) =>
      credit.status_id === CreditStatus.Draft && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'mark_sent',
          })}
          entity="credit"
          actionKey="mark_sent"
          isCommonActionSection={!dropdown}
          tooltipText={t('mark_sent')}
          onClick={() => markSent(credit)}
          icon={MdMarkEmailRead}
          disablePreventNavigation
        >
          {t('mark_sent')}
        </EntityActionElement>
      ),
    (credit) =>
      (credit.status_id === CreditStatus.Draft ||
        credit.status_id === CreditStatus.Sent ||
        credit.status_id === CreditStatus.Partial) &&
      credit.amount < 0 && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'mark_paid',
          })}
          entity="credit"
          actionKey="mark_paid"
          isCommonActionSection={!dropdown}
          tooltipText={t('mark_paid')}
          onClick={() => markPaid(credit)}
          icon={MdPaid}
          disablePreventNavigation
        >
          {t('mark_paid')}
        </EntityActionElement>
      ),
    (credit) => (
      <EntityActionElement
        {...(!dropdown && {
          key: 'run_template',
        })}
        entity="credit"
        actionKey="run_template"
        isCommonActionSection={!dropdown}
        tooltipText={t('run_template')}
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([credit]);
          setChangeTemplateEntityContext({
            endpoint: '/api/v1/credits/bulk',
            entity: 'credit',
          });
        }}
        icon={MdDesignServices}
      >
        {t('run_template')}
      </EntityActionElement>
    ),
    () => <Divider withoutPadding />,
    (credit) =>
      hasPermission('create_credit') && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'clone_to_credit',
          })}
          entity="credit"
          actionKey="clone_to_credit"
          isCommonActionSection={!dropdown}
          tooltipText={t('clone_to_credit')}
          onClick={() => cloneToCredit(credit)}
          icon={MdControlPointDuplicate}
        >
          {t('clone_to_credit')}
        </EntityActionElement>
      ),
    (credit) => (
      <CloneOptionsModal
        {...(!dropdown && {
          key: 'clone_to_other',
        })}
        dropdown={dropdown}
        credit={credit}
      />
    ),
    () => Boolean(isEditPage && dropdown) && <Divider withoutPadding />,
    (credit) =>
      isEditPage &&
      credit.archived_at === 0 && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'archive',
          })}
          entity="credit"
          actionKey="archive"
          isCommonActionSection={!dropdown}
          tooltipText={t('archive')}
          onClick={() => bulk([credit.id], 'archive')}
          icon={MdArchive}
          excludePreferences
          disablePreventNavigation
        >
          {t('archive')}
        </EntityActionElement>
      ),
    (credit) =>
      isEditPage &&
      credit.archived_at > 0 && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'restore',
          })}
          entity="credit"
          actionKey="restore"
          isCommonActionSection={!dropdown}
          tooltipText={t('restore')}
          onClick={() => bulk([credit.id], 'restore')}
          icon={MdRestore}
          excludePreferences
          disablePreventNavigation
        >
          {t('restore')}
        </EntityActionElement>
      ),
    (credit) =>
      isEditPage &&
      !credit?.is_deleted && (
        <EntityActionElement
          {...(!dropdown && {
            key: 'delete',
          })}
          entity="credit"
          actionKey="delete"
          isCommonActionSection={!dropdown}
          tooltipText={t('delete')}
          onClick={() => bulk([credit.id], 'delete')}
          icon={MdDelete}
          excludePreferences
          disablePreventNavigation
        >
          {t('delete')}
        </EntityActionElement>
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
  'remaining',
];

export function useAllCreditColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const creditColumns = [
    'status',
    'number',
    'client',
    'amount',
    'date',
    'remaining',
    'archived_at',
    // 'assigned_to', @Todo: Need to resolve relationship
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
    // 'project', @Todo: Need to fetch the relationship
    'public_notes',
    'tax_amount',
    'updated_at',
    'valid_until',
    // 'vendor', @Todo: Need to fetch the relationship
  ] as const;

  return creditColumns;
}

export function useCreditColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatNumber = useFormatNumber();
  const disableNavigation = useDisableNavigation();

  const creditColumns = useAllCreditColumns();
  type CreditColumns = (typeof creditColumns)[number];

  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const resolveCountry = useResolveCountry();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const columns: DataTableColumnsExtended<Credit, CreditColumns> = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (_value, credit) => <CreditStatusBadge entity={credit} />,
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, credit) => (
        <div className="flex space-x-2">
          <DynamicLink
            to={route('/credits/:id/edit', { id: credit.id })}
            renderSpan={disableNavigation('credit', credit)}
          >
            {value}
          </DynamicLink>

          <CopyToClipboardIconOnly text={credit.number} />
        </div>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (_, credit) => (
        <DynamicLink
          to={route('/clients/:id', { id: credit.client_id })}
          renderSpan={disableNavigation('client', credit.client)}
        >
          {credit.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, credit) =>
        formatMoney(
          value,
          credit.client?.country_id,
          credit.client?.settings.currency_id
        ),
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'remaining',
      id: 'balance',
      label: t('remaining'),
      format: (_, credit) =>
        formatMoney(
          credit.balance,
          credit.client?.country_id,
          credit.client?.settings.currency_id
        ),
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
      format: (value, credit) => credit.client?.city,
    },
    {
      column: 'client_country',
      id: 'client_id',
      label: t('client_country'),
      format: (value, credit) =>
        credit.client?.country_id &&
        resolveCountry(credit.client?.country_id)?.name,
    },
    {
      column: 'client_postal_code',
      id: 'client_id',
      label: t('client_postal_code'),
      format: (value, credit) => credit.client?.postal_code,
    },
    {
      column: 'client_state',
      id: 'client_id',
      label: t('client_state'),
      format: (value, credit) => credit.client?.state,
    },
    {
      column: 'contact_email',
      id: 'client_id',
      label: t('contact_email'),
      format: (value, credit) =>
        credit.client &&
        credit.client.contacts.length > 0 && (
          <CopyToClipboard text={credit.client?.contacts[0].email} />
        ),
    },
    {
      column: 'contact_name',
      id: 'client_id',
      label: t('contact_name'),
      format: (value, credit) =>
        credit.client &&
        credit.client.contacts.length > 0 &&
        `${credit.client?.contacts[0].first_name} ${credit.client?.contacts[0].last_name}`,
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
      format: (value, credit) =>
        credit.is_amount_discount
          ? formatMoney(
              value,
              credit.client?.country_id,
              credit.client?.settings.currency_id
            )
          : `${formatNumber(value)} %`,
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, credit) => credit.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, credit) => <EntityStatus entity={credit} />,
    },
    {
      column: 'exchange_rate',
      id: 'exchange_rate',
      label: t('exchange_rate'),
      format: (value) => formatNumber(value),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, credit) => (credit.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'is_viewed',
      id: 'id',
      label: t('is_viewed'),
      format: (value, credit) =>
        resourceViewedAt(credit).length > 0
          ? date(resourceViewedAt(credit), dateFormat)
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
      format: (value, credit) =>
        formatMoney(
          value,
          credit.client?.country_id,
          credit.client?.settings.currency_id
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
          width="auto"
          tooltipElement={
            <div className="w-full max-h-48 overflow-auto whitespace-normal break-all">
              <article
                className={classNames('prose prose-sm', {
                  'prose-invert': !reactSettings?.dark_mode,
                })}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(value as string),
                }}
              />
            </div>
          }
        >
          <span>
            {extractTextFromHTML(sanitizeHTML(value as string)).slice(0, 50)}
          </span>
        </Tooltip>
      ),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => (
        <Tooltip
          width="auto"
          tooltipElement={
            <div className="w-full max-h-48 overflow-auto whitespace-normal break-all">
              <article
                className={classNames('prose prose-sm', {
                  'prose-invert': !reactSettings?.dark_mode,
                })}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(value as string),
                }}
              />
            </div>
          }
        >
          <span>
            {extractTextFromHTML(sanitizeHTML(value as string)).slice(0, 50)}
          </span>
        </Tooltip>
      ),
    },
    {
      column: 'tax_amount',
      id: 'total_taxes',
      label: t('total_taxes'),
      format: (value, credit) =>
        formatMoney(
          value,
          credit.client?.country_id,
          credit.client?.settings.currency_id
        ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'valid_until',
      id: 'due_date',
      label: t('valid_until'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.credit || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
