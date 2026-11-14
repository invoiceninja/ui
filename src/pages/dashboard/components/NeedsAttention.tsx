/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdChevronRight,
  MdClose,
  MdOutlineEmail,
  MdOutlinePayments,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { endpoint, trans } from '$app/common/helpers';
import { hasContactWithEmail } from '$app/common/helpers/emails/has-contact-with-email';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useInvoiceEditorPaths } from '$app/common/hooks/useInvoiceEditor';
import {
  useReactSettings,
  useSaveReactSettings,
  useUpdateReactSettings,
} from '$app/common/hooks/useReactSettings';
import { useStoreSessionTableFilters } from '$app/common/hooks/useStoreSessionTableFilters';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { Badge } from '$app/components/Badge';
import { Card } from '$app/components/cards';
import { DynamicLink } from '$app/components/DynamicLink';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';
import { Icon } from '$app/components/icons/Icon';
import { Tooltip } from '$app/components/Tooltip';
import {
  daysLate,
  lateAmount,
  NEEDS_ATTENTION_CARD,
  NEEDS_ATTENTION_COLUMN_WIDTH,
  NEEDS_ATTENTION_MAX_COLUMNS,
  NEEDS_ATTENTION_ROWS,
  nextReminderTemplate,
  splitIntoColumns,
} from '../helpers/needs-attention';

interface RowProps {
  invoice: Invoice;
  canRemind: boolean;
  showRemindSlot: boolean;
  showPaymentSlot: boolean;
}

function NeedsAttentionRow(props: RowProps) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const invoicePaths = useInvoiceEditorPaths();
  const disableNavigation = useDisableNavigation();

  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  const { invoice, canRemind, showRemindSlot, showPaymentSlot } = props;

  const today = dayjs().startOf('day');
  const days = daysLate(invoice, today);

  const handleRemind = () => {
    if (!hasContactWithEmail(invoice.client?.contacts)) {
      setIsContactModalOpen(true);
      return;
    }

    navigate(
      route('/invoices/:id/email?template=:template', {
        id: invoice.id,
        template: nextReminderTemplate(invoice),
      })
    );
  };

  return (
    <div className="flex flex-col px-4 py-3 space-y-1">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center min-w-0 text-sm">
          <DynamicLink
            className="font-semibold shrink-0"
            to={route(invoicePaths.edit, { id: invoice.id })}
            renderSpan={disableNavigation('invoice', invoice)}
          >
            {invoice.number}
          </DynamicLink>

          <span className="truncate" style={{ color: colors.$3 }}>
            &nbsp;·&nbsp;{invoice.client?.display_name}
          </span>
        </div>

        <span
          className="text-sm font-mono whitespace-nowrap"
          style={{ color: colors.$3 }}
        >
          {formatMoney(
            lateAmount(invoice, today),
            invoice.client?.country_id,
            invoice.client?.settings?.currency_id
          )}
        </span>
      </div>

      <div className="flex items-center justify-between space-x-3">
        <div className="text-xs truncate">
          <span className="font-semibold text-red-500">
            {days > 0
              ? trans('days_late',
                  { count: days }
                )
              : t('past_due')}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {showRemindSlot && (
            <div className={classNames({ invisible: !canRemind })}>
              <Tooltip
                message={t('remind_invoice') as string}
                width="auto"
                placement="bottom"
                withoutArrow
              >
                <button
                  type="button"
                  className="flex items-center"
                  onClick={handleRemind}
                  disabled={!canRemind}
                  aria-label={t('remind_invoice') as string}
                >
                  <Icon
                    element={MdOutlineEmail}
                    size={18}
                    style={{ color: colors.$17 }}
                  />
                </button>
              </Tooltip>
            </div>
          )}

          {showPaymentSlot && (
            <Tooltip
              message={t('enter_payment') as string}
              width="auto"
              placement="bottom"
              withoutArrow
            >
              <button
                type="button"
                className="flex items-center"
                aria-label={t('enter_payment') as string}
                onClick={() =>
                  navigate(
                    route(
                      '/payments/create?invoice=:invoiceId&client=:clientId',
                      { invoiceId: invoice.id, clientId: invoice.client_id }
                    )
                  )
                }
              >
                <Icon
                  element={MdOutlinePayments}
                  size={18}
                  style={{ color: colors.$17 }}
                />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <ContactEmailModal
        visible={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        relation="client"
        relationId={invoice.client_id}
      />
    </div>
  );
}

export function NeedsAttention() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const reactSettings = useReactSettings();
  const saveSettings = useSaveReactSettings();
  const updateSettings = useUpdateReactSettings();
  const storeSessionTableFilters = useStoreSessionTableFilters({
    tableKey: 'invoices',
  });

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  const hiddenCards = reactSettings.hidden_dashboard_cards ?? [];
  const isHidden = hiddenCards.includes(NEEDS_ATTENTION_CARD);

  const { data } = useQuery({
    queryKey: ['/api/v1/invoices', 'needs_attention'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/invoices?include=client&overdue=true&without_deleted_clients=true&status=active&per_page=50&page=1&sort=due_date|asc'
        )
      ).then(
        (response: AxiosResponse<GenericManyResponse<Invoice>>) => response.data
      ),
    enabled: !isHidden,
    staleTime: 300000,
  });

  useLayoutEffect(() => {
    if (!container) {
      return;
    }

    setWidth(container.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [container]);

  const invoices = data?.data ?? [];
  const count = data?.meta?.pagination?.total ?? invoices.length;

  if (isHidden || !invoices.length) {
    return null;
  }

  const today = dayjs().startOf('day');

  const currencyOf = (invoice: Invoice) => {
    return (
      invoice.client?.settings?.currency_id || company?.settings.currency_id
    );
  };

  const isTotalProven =
    count === invoices.length &&
    invoices.every(
      (invoice) => currencyOf(invoice) === currencyOf(invoices[0])
    );

  const maxColumns = Math.min(
    NEEDS_ATTENTION_MAX_COLUMNS,
    Math.max(1, Math.floor(width / NEEDS_ATTENTION_COLUMN_WIDTH))
  );

  const columns = splitIntoColumns(
    invoices.slice(0, maxColumns * NEEDS_ATTENTION_ROWS),
    maxColumns
  );

  const canRemind = (invoice: Invoice) => {
    return hasPermission('edit_invoice') || entityAssigned(invoice);
  };

  const showRemindSlot = invoices.some(canRemind);
  const showPaymentSlot = hasPermission('create_payment');

  const canViewAll =
    hasPermission('view_invoice') ||
    hasPermission('create_invoice') ||
    hasPermission('edit_invoice');

  const handleHide = () => {
    saveSettings('hidden_dashboard_cards', [
      ...hiddenCards,
      NEEDS_ATTENTION_CARD,
    ]).catch(() => undefined);
  };

  const handleViewAll = () => {
    updateSettings('table_filters.invoices', {
      ...(reactSettings.table_filters?.invoices ?? {}),
      customFilter: ['overdue'],
      status: ['active'],
      sort: 'due_date|asc',
      sortedBy: 'due_date',
    });

    storeSessionTableFilters('', 1);

    navigate('/invoices');
  };

  return (
    <Card
      title={t('needs_your_attention')}
      className="shadow-sm mb-8"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      withoutBodyPadding
      withoutHeaderPadding
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      topRight={
        <Tooltip
          message={t('hide') as string}
          width="auto"
          placement="bottom"
          withoutArrow
        >
          <button
            type="button"
            className="flex items-center"
            onClick={handleHide}
            aria-label={t('hide') as string}
          >
            <Icon element={MdClose} size={20} style={{ color: colors.$17 }} />
          </button>
        </Tooltip>
      }
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: colors.$20 }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium" style={{ color: colors.$3 }}>
            {t('past_due')}
          </span>

          <Badge variant="red">{count}</Badge>

          {isTotalProven && (
            <span className="text-sm font-mono" style={{ color: colors.$17 }}>
              {formatMoney(
                invoices.reduce(
                  (sum, invoice) => sum + lateAmount(invoice, today),
                  0
                ),
                invoices[0].client?.country_id,
                currencyOf(invoices[0])
              )}
            </span>
          )}
        </div>

        {canViewAll && (
          <button
            type="button"
            className="flex items-center text-sm"
            style={{ color: colors.$17 }}
            onClick={handleViewAll}
          >
            {t('view_all')}

            <Icon
              element={MdChevronRight}
              size={18}
              style={{ color: colors.$17 }}
            />
          </button>
        )}
      </div>

      <div
        ref={setContainer}
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={classNames('flex flex-col', {
              'border-l': columnIndex > 0,
            })}
            style={{ borderColor: colors.$20 }}
          >
            {column.map((invoice, rowIndex) => (
              <div
                key={invoice.id}
                className={classNames({
                  'border-b': rowIndex < column.length - 1,
                })}
                style={{ borderColor: colors.$20 }}
              >
                <NeedsAttentionRow
                  invoice={invoice}
                  canRemind={canRemind(invoice)}
                  showRemindSlot={showRemindSlot}
                  showPaymentSlot={showPaymentSlot}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
