/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import reactStringReplace from 'react-string-replace';
import { trans } from '$app/common/helpers';
import { useInvoiceEditorPaths } from '$app/common/hooks/useInvoiceEditor';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { PaymentActivity } from '$app/common/interfaces/payment-activity';
import { DynamicLink } from '$app/components/DynamicLink';
import { Link } from '$app/components/forms';

export function useGenerateActivityElement() {
  const invoicePaths = useInvoiceEditorPaths();
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  return (activity: PaymentActivity) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <DynamicLink
          to={route('/clients/:id', { id: activity.client?.hashed_id })}
          renderSpan={disableNavigation('client', null)}
        >
          {activity.client?.label}
        </DynamicLink>
      ),
      user: activity.user?.label ?? t('system'),
      payment_amount: activity?.payment_amount?.label,
      adjustment: activity?.adjustment?.label,
      invoice: (
        <DynamicLink
          to={route(invoicePaths.edit, {
            id: activity.invoice?.hashed_id,
          })}
          renderSpan={disableNavigation('invoice', null)}
        >
          {activity?.invoice?.label}
        </DynamicLink>
      ),
      payment: (
        <Link
          to={route('/payments/:id/edit', {
            id: activity.payment?.hashed_id,
          })}
        >
          {activity?.payment?.label}
        </Link>
      ),
      contact: (
        <DynamicLink
          to={route('/clients/:id/edit', {
            id: activity?.contact?.hashed_id,
          })}
          renderSpan={!hasPermission('edit_client')}
        >
          {activity?.contact?.label}
        </DynamicLink>
      ),
    };
    for (const [variable, value] of Object.entries(replacements)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      text = reactStringReplace(text, `:${variable}`, () => value);
    }

    return text;
  };
}
