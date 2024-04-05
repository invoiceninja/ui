/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Invoice } from '$app/common/interfaces/invoice';
import { TabGroup } from '$app/components/TabGroup';
import { ClickableElement, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  generateClientPortalUrl,
  openClientPortal,
} from '../helpers/open-client-portal';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date, endpoint, trans } from '$app/common/helpers';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../../edit/components/Actions';
import { toast } from '$app/common/helpers/toast/toast';
import { useQuery, useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import { PaymentStatus } from '$app/pages/payments/common/components/PaymentStatus';
import { InvoiceStatus } from './InvoiceStatus';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Link } from '$app/components/forms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Inline } from '$app/components/Inline';
import { Icon } from '$app/components/icons/Icon';
import { MdCloudCircle, MdInfo, MdOutlineContentCopy } from 'react-icons/md';
import { InvoiceActivity } from '$app/common/interfaces/invoice-activity';
import { route } from '$app/common/helpers/route';
import reactStringReplace from 'react-string-replace';
import { Payment, Paymentable } from '$app/common/interfaces/payment';
import { Tooltip } from '$app/components/Tooltip';
import { useEffect, useState } from 'react';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { EmailRecord } from '$app/components/EmailRecord';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';

export const invoiceSliderAtom = atom<Invoice | null>(null);
export const invoiceSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

export function useGenerateActivityElement() {
  const [t] = useTranslation();

  return (activity: InvoiceActivity) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {activity.client?.label}
        </Link>
      ),

      user: activity.user?.label ?? t('system'),
      invoice:
        (
          <Link
            to={route('/invoices/:id/edit', {
              id: activity.invoice?.hashed_id,
            })}
          >
            {activity?.invoice?.label}
          </Link>
        ) ?? '',

      recurring_invoice:
        (
          <Link
            to={route('/recurring_invoices/:id/edit', {
              id: activity?.recurring_invoice?.hashed_id,
            })}
          >
            {activity?.recurring_invoice?.label}
          </Link>
        ) ?? '',

      contact:
        (
          <Link
            to={route('/clients/:id/edit', {
              id: activity?.contact?.hashed_id,
            })}
          >
            {activity?.contact?.label}
          </Link>
        ) ?? '',
    };
    for (const [variable, value] of Object.entries(replacements)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      text = reactStringReplace(text, `:${variable}`, () => value);
    }

    return text;
  };
}

export function InvoiceSlider() {
  const [isVisible, setIsSliderVisible] = useAtom(invoiceSliderVisibilityAtom);
  const [invoice, setInvoice] = useAtom(invoiceSliderAtom);
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();

  const [emailRecords, setEmailRecords] = useState<EmailRecordType[]>([]);

  const queryClient = useQueryClient();

  const formatMoney = useFormatMoney();
  const actions = useActions({
    showCommonBulkAction: true,
    showEditAction: true,
  });

  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: resource } = useQuery({
    queryKey: ['/api/v1/invoices', invoice?.id, 'payments'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/invoices/${invoice?.id}?include=payments,activities.history&reminder_schedule=true`
        )
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    enabled: invoice !== null && isVisible,
    staleTime: Infinity,
  });

  const fetchEmailHistory = async () => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/invoices', invoice?.id, 'emailHistory'],
        () =>
          request('POST', endpoint('/api/v1/emails/entityHistory'), {
            entity: 'invoice',
            entity_id: invoice?.id,
          }),
        { staleTime: Infinity }
      )
      .then((response) => response.data);

    setEmailRecords(response);
  };

  useEffect(() => {
    if (invoice) {
      fetchEmailHistory();
    }
  }, [invoice]);

  //duplicate not needed
  // const { data: activities } = useQuery({
  //   queryKey: [`/api/v1/invoices`, invoice?.id, 'activities'],
  //   queryFn: () =>
  //     request(
  //       'GET',
  //       endpoint(`/api/v1/invoices/${invoice?.id}?include=payments,activities.history&reminder_schedule=true`)
  //     ).then(
  //       (response: GenericSingleResourceResponse<Invoice>) =>
  //         response.data.data.activities
  //     ),
  //   enabled: invoice !== null && isVisible,
  // });

  const { data: activities2 } = useQuery({
    queryKey: ['/api/v1/activities/entity', invoice?.id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'invoice',
        entity_id: invoice?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<InvoiceActivity>>) =>
          response.data.data
      ),
    enabled: invoice !== null && isVisible,
    staleTime: Infinity,
  });

  const activityElement = useGenerateActivityElement();

  return (
    <Slider
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setInvoice(null);
      }}
      size="regular"
      title={`${t('invoice')} ${invoice?.number}`}
      topRight={
        invoice &&
        (hasPermission('edit_invoice') || entityAssigned(invoice)) ? (
          <ResourceActions
            label={t('more_actions')}
            resource={invoice}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
    >
      <TabGroup
        tabs={[t('overview'), t('history'), t('activity'), t('email_history')]}
        width="full"
      >
        <div className="space-y-2">
          <div>
            <Element leftSide={t('invoice_amount')}>
              {invoice
                ? formatMoney(
                    invoice?.amount,
                    invoice.client?.country_id,
                    invoice.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('balance_due')}>
              {invoice
                ? formatMoney(
                    invoice.balance,
                    invoice.client?.country_id,
                    invoice.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('date')}>
              {invoice ? date(invoice?.date, dateFormat) : null}
            </Element>

            <Element leftSide={t('due_date')}>
              {invoice ? date(invoice.due_date, dateFormat) : null}
            </Element>

            <Element leftSide={t('status')}>
              {invoice ? <InvoiceStatus entity={invoice} /> : null}
            </Element>
          </div>

          <Divider withoutPadding />

          <Inline className="w-full">
            <ClickableElement
              className="text-center"
              onClick={() => (invoice ? openClientPortal(invoice) : null)}
            >
              <div className="inline-flex items-center space-x-1">
                <Icon element={MdCloudCircle} />
                <p>{t('view_portal')}</p>
              </div>
            </ClickableElement>

            {invoice ? (
              <ClickableElement
                className="text-center"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateClientPortalUrl(invoice) ?? ''
                  );

                  toast.success('copied_to_clipboard', { value: '' });
                }}
              >
                <div className="inline-flex items-center space-x-1">
                  <Icon element={MdOutlineContentCopy} />
                  <p>{t('copy_link')}</p>
                </div>
              </ClickableElement>
            ) : null}
          </Inline>

          <Divider withoutPadding />

          {invoice && invoice.next_send_date ? (
            <div className="space-y-2 whitespace-nowrap">
              <Tooltip
                size="regular"
                width="auto"
                containsUnsafeHTMLTags
                message={(resource?.reminder_schedule as string) ?? ''}
              >
                <h3 className="flex ml-3 mt-2 italic">
                  {t('reminders')} <MdInfo className="mt-1 ml-1" />
                </h3>
              </Tooltip>

              <Element leftSide={t('next_send_date')}>
                {invoice ? date(invoice.next_send_date, dateFormat) : null}
              </Element>

              <Element leftSide={t('reminder_last_sent')}>
                {invoice ? date(invoice.reminder_last_sent, dateFormat) : null}
              </Element>

              {invoice.reminder1_sent ? (
                <Element leftSide={t('first_reminder')}>
                  {invoice ? date(invoice.reminder1_sent, dateFormat) : null}
                </Element>
              ) : null}

              {invoice.reminder2_sent ? (
                <Element leftSide={t('second_reminder')}>
                  {invoice ? date(invoice.reminder2_sent, dateFormat) : null}
                </Element>
              ) : null}

              {invoice.reminder3_sent ? (
                <Element leftSide={t('third_reminder')}>
                  {invoice ? date(invoice.reminder3_sent, dateFormat) : null}
                </Element>
              ) : null}
            </div>
          ) : null}

          <div className="divide-y">
            {resource?.payments &&
              resource.payments.map((payment: Payment) => (
                payment.paymentables.filter((item) => item.invoice_id == invoice?.id && item.archived_at == 0).map((paymentable: Paymentable) => (
                <ClickableElement
                  key={payment.id}
                  to={`/payments/${payment.id}/edit`}
                  disableNavigation={disableNavigation('payment', payment)}
                >
                  <div className="flex flex-col space-y-2">
                    <p className="font-semibold">
                      {t('payment')} {payment.number}
                    </p>

                    <p className="inline-flex items-center space-x-1">
                      <p>
                        {formatMoney(
                          paymentable.amount,
                          payment.client?.country_id,
                          payment.client?.settings.currency_id
                        )}
                      </p>
                      <p>&middot;</p>
                        <p>{date(paymentable.created_at, dateFormat)}</p>
                    </p>

                    <div>
                      <PaymentStatus entity={payment} />
                    </div>
                  </div>
                </ClickableElement>
                ))
              ))}
          </div>
        </div>

        <div>
          {resource?.activities && resource.activities.length === 0 && (
            <NonClickableElement>
              {t('nothing_to_see_here')}
            </NonClickableElement>
          )}

          {resource?.activities &&
            resource.activities.map((activity) => (
              <ClickableElement
                key={activity.id}
                to={`/activities/${activity.id}`}
              >
                <div className="flex flex-col">
                  <div className="flex space-x-1">
                    <span>
                      {invoice?.client
                        ? formatMoney(
                            activity.history.amount,
                            invoice?.client?.country_id,
                            invoice?.client?.settings.currency_id
                          )
                        : null}
                    </span>
                    <span>&middot;</span>
                    <DynamicLink
                      to={`/clients/${activity.client_id}`}
                      renderSpan={disableNavigation('client', invoice?.client)}
                    >
                      {invoice?.client?.display_name}
                    </DynamicLink>
                  </div>

                  <div className="inline-flex items-center space-x-1">
                    <p>
                      {date(activity.created_at, `${dateFormat} h:mm:ss A`)}
                    </p>
                    <p>{dayjs.unix(activity.created_at).fromNow()}</p>
                  </div>
                </div>
              </ClickableElement>
            ))}
        </div>

        <div>
          {activities2?.map((activity) => (
            <NonClickableElement key={activity.id} className="flex flex-col">
              <p>{activityElement(activity)}</p>
              <p className="inline-flex items-center space-x-1">
                <p>{date(activity.created_at, `${dateFormat} h:mm:ss A`)}</p>
                <p>&middot;</p>
                <p>{activity.ip}</p>
              </p>
            </NonClickableElement>
          ))}
        </div>

        <div className="flex flex-col">
          {emailRecords.map((emailRecord, index) => (
            <EmailRecord
              key={index}
              className="py-4"
              emailRecord={emailRecord}
              index={index}
            />
          ))}
        </div>
      </TabGroup>
    </Slider>
  );
}
