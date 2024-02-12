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
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date, endpoint, trans } from '$app/common/helpers';
import { ResourceActions } from '$app/components/ResourceActions';
import { toast } from '$app/common/helpers/toast/toast';
import { useQuery, useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Link } from '$app/components/forms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Inline } from '$app/components/Inline';
import { Icon } from '$app/components/icons/Icon';
import { MdCloudCircle, MdInfo, MdOutlineContentCopy } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import reactStringReplace from 'react-string-replace';
import { Tooltip } from '$app/components/Tooltip';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useActions } from '../hooks';
import { QuoteStatus } from './QuoteStatus';
import { Quote } from '$app/common/interfaces/quote';
import {
  generateClientPortalUrl,
  openClientPortal,
} from '$app/pages/invoices/common/helpers/open-client-portal';
import { EmailRecord } from '$app/components/EmailRecord';
import { useEffect, useState } from 'react';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { QuoteActivity } from '$app/common/interfaces/quote-activity';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { InvoiceStatus } from '$app/pages/invoices/common/components/InvoiceStatus';

export const quoteSliderAtom = atom<Quote | null>(null);
export const quoteSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

function useGenerateActivityElement() {
  const [t] = useTranslation();

  return (activity: QuoteActivity) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {activity.client?.label}
        </Link>
      ),
      user: activity.user?.label ?? t('system'),
      quote:
        (
          <Link
            to={route('/quotes/:id/edit', {
              id: activity.quote?.hashed_id,
            })}
          >
            {activity?.quote?.label}
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

export function QuoteSlider() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const actions = useActions({
    showCommonBulkAction: true,
    showEditAction: true,
  });
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();
  const activityElement = useGenerateActivityElement();

  const [quote, setQuote] = useAtom(quoteSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(quoteSliderVisibilityAtom);

  const [emailRecords, setEmailRecords] = useState<EmailRecordType[]>([]);

  const { data: invoiceResponse } = useInvoiceQuery({ id: quote?.invoice_id });

  const { data: resource } = useQuery({
    queryKey: ['/api/v1/quotes', quote?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/quotes/${quote?.id}?include=activities.history&reminder_schedule=true`
        )
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    enabled: quote !== null && isVisible,
    staleTime: Infinity,
  });

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities', quote?.id, 'quote'],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'quote',
        entity_id: quote?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<QuoteActivity>>) =>
          response.data.data
      ),
    enabled: quote !== null && isVisible,
    staleTime: Infinity,
  });

  const fetchEmailHistory = async () => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/quotes', quote?.id, 'emailHistory'],
        () =>
          request('POST', endpoint('/api/v1/emails/entityHistory'), {
            entity: 'quote',
            entity_id: quote?.id,
          }),
        { staleTime: Infinity }
      )
      .then((response) => response.data);

    setEmailRecords(response);
  };

  useEffect(() => {
    if (quote) {
      fetchEmailHistory();
    }
  }, [quote]);

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setQuote(null);
      }}
      title={`${t('quote')} ${quote?.number}`}
      topRight={
        quote &&
        (hasPermission('edit_quote') || entityAssigned(quote)) && (
          <ResourceActions
            label={t('more_actions')}
            resource={quote}
            actions={actions}
          />
        )
      }
      withoutActionContainer
    >
      <TabGroup
        tabs={[t('overview'), t('history'), t('activity'), t('email_history')]}
        width="full"
      >
        <div className="space-y-2">
          <div>
            <Element leftSide={t('quote_amount')}>
              {quote
                ? formatMoney(
                    quote?.amount,
                    quote.client?.country_id,
                    quote.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('balance_due')}>
              {quote
                ? formatMoney(
                    quote.balance,
                    quote.client?.country_id,
                    quote.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('date')}>
              {quote ? date(quote?.date, dateFormat) : null}
            </Element>

            <Element leftSide={t('valid_until')}>
              {quote ? date(quote.due_date, dateFormat) : null}
            </Element>

            <Element leftSide={t('status')}>
              {quote ? <QuoteStatus entity={quote} /> : null}
            </Element>
          </div>

          <Divider withoutPadding />

          <Inline className="w-full">
            <ClickableElement
              className="text-center"
              onClick={() => quote && openClientPortal(quote)}
            >
              <div className="inline-flex items-center space-x-1">
                <Icon element={MdCloudCircle} />
                <p>{t('view_portal')}</p>
              </div>
            </ClickableElement>

            {quote ? (
              <ClickableElement
                className="text-center"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateClientPortalUrl(quote) ?? ''
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

          {quote && quote.next_send_date ? (
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
                {quote ? date(quote.next_send_date, dateFormat) : null}
              </Element>

              <Element leftSide={t('reminder_last_sent')}>
                {quote ? date(quote.reminder_last_sent, dateFormat) : null}
              </Element>

              {quote.reminder1_sent ? (
                <Element leftSide={t('first_reminder')}>
                  {quote ? date(quote.reminder1_sent, dateFormat) : null}
                </Element>
              ) : null}

              {quote.reminder2_sent ? (
                <Element leftSide={t('second_reminder')}>
                  {quote ? date(quote.reminder2_sent, dateFormat) : null}
                </Element>
              ) : null}

              {quote.reminder3_sent ? (
                <Element leftSide={t('third_reminder')}>
                  {quote ? date(quote.reminder3_sent, dateFormat) : null}
                </Element>
              ) : null}
            </div>
          ) : null}

          {invoiceResponse && (
            <ClickableElement
              to={route('/invoices/:id/edit', {
                id: invoiceResponse.id,
              })}
              disableNavigation={disableNavigation('invoice', invoiceResponse)}
            >
              <div className="flex flex-col space-y-2">
                <p className="font-semibold">
                  {t('invoice')} {invoiceResponse.number}
                </p>

                <div className="flex items-center space-x-1">
                  <p>
                    {formatMoney(
                      invoiceResponse.amount,
                      invoiceResponse.client?.country_id,
                      invoiceResponse.client?.settings.currency_id
                    )}
                  </p>
                  <p>&middot;</p>
                  <p>{date(invoiceResponse.date, dateFormat)}</p>
                </div>

                <div>
                  <InvoiceStatus entity={invoiceResponse} />
                </div>
              </div>
            </ClickableElement>
          )}
        </div>

        <div>
          {resource?.activities &&
            resource.activities.map((activity) => (
              <ClickableElement
                key={activity.id}
                to={`/activities/${activity.id}`}
              >
                <div className="flex flex-col">
                  <div className="flex space-x-1">
                    <span>
                      {quote?.client
                        ? formatMoney(
                            activity.history.amount,
                            quote?.client?.country_id,
                            quote?.client?.settings.currency_id
                          )
                        : null}
                    </span>
                    <span>&middot;</span>
                    <DynamicLink
                      to={`/clients/${activity.client_id}`}
                      renderSpan={disableNavigation('client', quote?.client)}
                    >
                      {quote?.client?.display_name}
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
          {activities?.map((activity) => (
            <NonClickableElement key={activity.id} className="flex flex-col">
              <p>{activityElement(activity)}</p>
              <div className="inline-flex items-center space-x-1">
                <p>{date(activity.created_at, `${dateFormat} h:mm:ss A`)}</p>
                <p>&middot;</p>
                <p>{activity.ip}</p>
              </div>
            </NonClickableElement>
          ))}
        </div>

        <div className="flex flex-col">
          {emailRecords?.map((emailRecord, index) => (
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
