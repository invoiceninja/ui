/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import {
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useDateTime } from '$app/common/hooks/useDateTime';
import { $refetch } from '$app/common/hooks/useRefetch';
import type { Invoice } from '$app/common/interfaces/invoice';
import { Badge, type BadgeVariant } from '$app/components/Badge';
import { Card, Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import {
  getQuickbooksInvoiceActions,
  hasQuickbooksConnection,
  type QuickbooksCheckAction,
  type QuickbooksCheckOutcome,
  type QuickbooksCheckRecordResponse,
  type QuickbooksInvoiceAction,
  type QuickbooksInvoiceCheck,
} from '../../common/helpers/quickbooks';
import type { Context } from '../Edit';

const actionLabels: Record<QuickbooksInvoiceAction, string> = {
  check_record: 'Check Record',
  force_link: 'Force Link',
  force_pull: 'Force Pull',
  force_push: 'Force Push',
};

const recommendedActionLabels: Record<QuickbooksCheckAction, string> = {
  force_link: 'Force Link',
  force_pull: 'Force Pull',
  force_push: 'Force Push',
  change_invoice_number: 'Change Invoice Number',
  verify_quickbooks_invoice: 'Verify QuickBooks Invoice',
};

const amountMismatchGuidance =
  'Same invoice number found in QuickBooks with a different amount. Update the amount or rename the invoice before retrying.';

export default function Quickbooks() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dateTime = useDateTime({ withTimezone: true });
  const formatMoney = useFormatMoney();
  const { id } = useParams();

  const { invoice, setInvoice } = useOutletContext<Context>();

  const [processingAction, setProcessingAction] =
    useState<QuickbooksInvoiceAction>();
  const [checkResult, setCheckResult] = useState<QuickbooksInvoiceCheck>();
  const checkResultRef = useRef<HTMLDivElement>(null);
  const activeInvoiceIdRef = useRef(id);

  activeInvoiceIdRef.current = id;

  useEffect(() => {
    setCheckResult(undefined);
  }, [id]);

  useEffect(
    () => () => {
      activeInvoiceIdRef.current = undefined;
    },
    []
  );

  useEffect(() => {
    if (checkResult) {
      checkResultRef.current?.focus();
    }
  }, [checkResult]);

  if (!hasQuickbooksConnection(company)) {
    return (
      <Navigate
        to={route('/invoices/:id/edit', { id: id || invoice?.id })}
        replace
      />
    );
  }

  const actions: QuickbooksInvoiceAction[] = checkResult
    ? ['check_record']
    : getQuickbooksInvoiceActions(invoice, company);
  const status = invoice?.sync?.qb_status;
  const message =
    invoice?.sync?.qb_status_message ||
    (status === 'amount_mismatch' ? amountMismatchGuidance : '');

  const handleAction = (action: QuickbooksInvoiceAction) => {
    if (!invoice || processingAction) {
      return;
    }

    const requestedInvoiceId = invoice.id;

    if (action === 'check_record') {
      setCheckResult(undefined);
    }

    setProcessingAction(action);
    toast.processing();

    request('POST', endpoint('/api/v1/quickbooks/action'), {
      entity: 'invoice',
      id: invoice.id,
      action,
    })
      .then(async (response) => {
        if (activeInvoiceIdRef.current !== requestedInvoiceId) {
          return;
        }

        if (action === 'check_record') {
          const result = response.data as QuickbooksCheckRecordResponse;

          setInvoice((current) => mergeQuickbooksSync(current, result.data));
          queryClient.setQueryData<Invoice>(
            ['/api/v1/invoices', 'detail', requestedInvoiceId],
            (current) => mergeQuickbooksSync(current, result.data)
          );
          setCheckResult(result.meta.quickbooks_check);
        } else {
          setCheckResult(undefined);
        }

        toast.success();

        if (action !== 'check_record') {
          await queryClient.invalidateQueries([
            '/api/v1/invoices',
            'detail',
            invoice.id,
          ]);

          $refetch(['invoices']);
        }
      })
      .catch(() => {
        if (activeInvoiceIdRef.current === requestedInvoiceId) {
          toast.error();
        }
      })
      .finally(() => {
        if (activeInvoiceIdRef.current !== requestedInvoiceId) {
          toast.dismiss();
        }

        setProcessingAction(undefined);
      });
  };

  const handleRecommendedAction = (action: QuickbooksCheckAction) => {
    if (
      action === 'force_link' ||
      action === 'force_pull' ||
      action === 'force_push'
    ) {
      handleAction(action);
      return;
    }

    if (action === 'change_invoice_number') {
      navigate(
        `${route('/invoices/:id/edit', { id: invoice?.id })}?focus=number`
      );
      return;
    }

    toast.info(
      'Inspect the corresponding invoice in QuickBooks, then run Check Record again.'
    );
  };

  return (
    <div className="space-y-4">
      <Card
        title={t('quickbooks')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <div className="flex justify-center w-full pb-10 pt-2">
          <div className="grid grid-cols-12 gap-4 px-6 w-full xl:w-2/3">
            <div className="col-span-12 space-y-2">
              <Element leftSide="QuickBooks ID" noExternalPadding>
                <span className="text-sm" style={{ color: colors.$3 }}>
                  {invoice?.sync?.qb_id || t('unknown')}
                </span>
              </Element>

              <Element leftSide={t('status')} noExternalPadding>
                <Badge variant={statusVariant(status)}>
                  {formatStatus(status || t('unknown'))}
                </Badge>
              </Element>

              {message && (
                <Element
                  leftSide={t('message')}
                  noExternalPadding
                  textVerticalAlign="top"
                >
                  <span className="text-sm" style={{ color: colors.$3 }}>
                    {message}
                  </span>
                </Element>
              )}

              {actions.length > 0 && (
                <Element leftSide={t('action')} noExternalPadding>
                  <div className="flex flex-wrap gap-3">
                    {actions.map((action) => (
                      <Button
                        key={action}
                        behavior="button"
                        type={action === 'force_push' ? 'secondary' : 'primary'}
                        onClick={() => handleAction(action)}
                        disabled={Boolean(processingAction)}
                        disableWithoutIcon={processingAction !== action}
                      >
                        {actionLabels[action]}
                      </Button>
                    ))}
                  </div>
                </Element>
              )}
            </div>
          </div>
        </div>
      </Card>

      {checkResult && (
        <div
          ref={checkResultRef}
          role="region"
          aria-label="QuickBooks check results"
          tabIndex={-1}
          className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="sr-only" aria-live="polite">
            QuickBooks check complete: {checkResult.message}
          </div>

          <Card
            title="QuickBooks Check"
            className="shadow-sm"
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
            topRight={
              <Badge variant={checkOutcomeVariant(checkResult.outcome)}>
                {formatStatus(checkResult.outcome)}
              </Badge>
            }
          >
            <div className="px-6 pb-6 space-y-6">
              <p className="text-sm">{checkResult.message}</p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CheckMetadata
                  label="Checked"
                  value={dateTime(checkResult.checked_at)}
                />
                <CheckMetadata
                  label="Connection"
                  value={checkResult.linked ? 'Linked' : 'Not linked'}
                />
                {checkResult.quickbooks && (
                  <>
                    <CheckMetadata
                      label="QuickBooks ID"
                      value={checkResult.quickbooks.id}
                    />
                    <CheckMetadata
                      label="QuickBooks status"
                      value={checkResult.quickbooks.status}
                    />
                    <CheckMetadata
                      label="QuickBooks balance"
                      value={String(
                        formatMoney(
                          checkResult.quickbooks.balance,
                          invoice?.client?.country_id,
                          invoice?.client?.settings?.currency_id
                        )
                      )}
                    />
                    <CheckMetadata
                      label="QuickBooks last updated"
                      value={dateTime(checkResult.quickbooks.last_updated_at)}
                    />
                  </>
                )}
              </div>

              {checkResult.comparison && (
                <div className="overflow-x-auto">
                  <table
                    className="w-full min-w-[40rem] text-sm"
                    aria-label="QuickBooks invoice comparison"
                  >
                    <thead>
                      <tr
                        className="border-b"
                        style={{ borderColor: colors.$20 }}
                      >
                        <th scope="col" className="py-2 text-left font-medium">
                          Field
                        </th>
                        <th scope="col" className="py-2 text-left font-medium">
                          Invoice Ninja
                        </th>
                        <th scope="col" className="py-2 text-left font-medium">
                          QuickBooks
                        </th>
                        <th scope="col" className="py-2 text-left font-medium">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <ComparisonRow
                        label="Number"
                        invoiceNinja={
                          checkResult.comparison.number.invoice_ninja
                        }
                        quickbooks={checkResult.comparison.number.quickbooks}
                        matches={checkResult.comparison.number.matches}
                        borderColor={colors.$20}
                      />
                      <ComparisonRow
                        label="Total"
                        invoiceNinja={formatMoney(
                          checkResult.comparison.total.invoice_ninja,
                          invoice?.client?.country_id,
                          invoice?.client?.settings?.currency_id
                        )}
                        quickbooks={formatMoney(
                          checkResult.comparison.total.quickbooks,
                          invoice?.client?.country_id,
                          invoice?.client?.settings?.currency_id
                        )}
                        matches={checkResult.comparison.total.matches}
                        borderColor={colors.$20}
                      />
                    </tbody>
                  </table>
                </div>
              )}

              {checkResult.recommended_actions.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {checkResult.recommended_actions.map((action) => (
                    <Button
                      key={action}
                      behavior="button"
                      type="primary"
                      onClick={() => handleRecommendedAction(action)}
                      disabled={Boolean(processingAction)}
                      disableWithoutIcon={processingAction !== action}
                    >
                      {recommendedActionLabels[action]}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function mergeQuickbooksSync(
  current: Invoice | undefined,
  fresh: Invoice
): Invoice {
  return current
    ? {
        ...current,
        sync: fresh.sync,
      }
    : fresh;
}

function CheckMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function ComparisonRow({
  label,
  invoiceNinja,
  quickbooks,
  matches,
  borderColor,
}: {
  label: string;
  invoiceNinja: string | number;
  quickbooks: string | number;
  matches: boolean;
  borderColor: string;
}) {
  return (
    <tr className="border-t" style={{ borderColor }}>
      <th scope="row" className="py-3 text-left font-medium">
        {label}
      </th>
      <td className="py-3">{invoiceNinja}</td>
      <td className="py-3">{quickbooks}</td>
      <td className="py-3">
        <Badge variant={matches ? 'green' : 'red'}>
          {matches ? 'Matches' : 'Different'}
        </Badge>
      </td>
    </tr>
  );
}

function checkOutcomeVariant(outcome: QuickbooksCheckOutcome): BadgeVariant {
  if (outcome === 'syncable' || outcome === 'synced') {
    return 'green';
  }

  if (outcome === 'linkable') {
    return 'blue';
  }

  if (outcome === 'data_mismatch') {
    return 'orange';
  }

  return 'red';
}

function statusVariant(status: string | null | undefined): BadgeVariant {
  if (status === 'synced') {
    return 'green';
  }

  if (status === 'amount_mismatch' || status === 'data_mismatch') {
    return 'red';
  }

  if (status === 'linkable') {
    return 'orange';
  }

  if (status === 'syncable') {
    return 'blue';
  }

  return 'generic';
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
