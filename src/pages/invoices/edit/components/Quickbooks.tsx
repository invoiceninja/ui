/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { request } from '$app/common/helpers/request';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Badge, type BadgeVariant } from '$app/components/Badge';
import { Button } from '$app/components/forms';
import { Card, Element } from '$app/components/cards';
import { route } from '$app/common/helpers/route';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Navigate, useOutletContext, useParams } from 'react-router-dom';
import type { Context } from '../Edit';
import {
  getQuickbooksInvoiceActions,
  hasQuickbooksConnection,
  type QuickbooksInvoiceAction,
} from '../../common/helpers/quickbooks';

const actionLabels: Record<QuickbooksInvoiceAction, string> = {
  force_link: 'Force Link',
  force_pull: 'Force Pull',
  force_push: 'Force Push',
};

const amountMismatchGuidance =
  'Same invoice number found in QuickBooks with a different amount. Update the amount or rename the invoice before retrying.';

export default function Quickbooks() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const { invoice } = useOutletContext<Context>();

  const [processingAction, setProcessingAction] =
    useState<QuickbooksInvoiceAction>();

  if (!hasQuickbooksConnection(company)) {
    return (
      <Navigate
        to={route('/invoices/:id/edit', { id: id || invoice?.id })}
        replace
      />
    );
  }

  const actions = getQuickbooksInvoiceActions(invoice, company);
  const status = invoice?.sync?.qb_status;
  const message =
    invoice?.sync?.qb_status_message ||
    (status === 'amount_mismatch' ? amountMismatchGuidance : '');

  const handleAction = (action: QuickbooksInvoiceAction) => {
    if (!invoice || processingAction) {
      return;
    }

    setProcessingAction(action);
    toast.processing();

    request('POST', endpoint('/api/v1/quickbooks/action'), {
      entity: 'invoice',
      id: invoice.id,
      action,
    })
      .then(async () => {
        toast.success();

        await queryClient.invalidateQueries([
          '/api/v1/invoices',
          'detail',
          invoice.id,
        ]);

        $refetch(['invoices']);
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => {
        setProcessingAction(undefined);
      });
  };

  return (
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
  );
}

function statusVariant(status: string | null | undefined): BadgeVariant {
  if (status === 'synced') {
    return 'green';
  }

  if (status === 'amount_mismatch') {
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
