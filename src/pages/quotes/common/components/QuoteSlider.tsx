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
import { Element } from '$app/components/cards';
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
import { MdInfo } from 'react-icons/md';
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
import React, { useEffect, useState } from 'react';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { QuoteActivity } from '$app/common/interfaces/quote-activity';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { InvoiceStatus } from '$app/pages/invoices/common/components/InvoiceStatus';
import { sanitizeHTML } from '$app/common/helpers/html-string';
import Toggle from '$app/components/forms/Toggle';
import { AddActivityComment } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { useColorScheme } from '$app/common/colors';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useDateTime } from '$app/common/hooks/useDateTime';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { useGetTimezone } from '$app/common/hooks/useGetTimezone';
import classNames from 'classnames';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CloudPlay } from '$app/components/icons/CloudPlay';
import { CopyToClipboard } from '$app/components/icons/CopyToClipboard';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { History } from '$app/components/icons/History';
import { SquareActivityChart } from '$app/components/icons/SquareActivityChart';

export const quoteSliderAtom = atom<Quote | null>(null);
export const quoteSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

const PortalCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

const HistoryBox = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

const ActivityBox = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

const InvoiceBox = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function useGenerateActivityElement() {
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
      quote: (
        <Link
          to={route('/quotes/:id/edit', {
            id: activity.quote?.hashed_id,
          })}
        >
          {activity?.quote?.label}
        </Link>
      ),
      contact: (
        <Link
          to={route('/clients/:id/edit', {
            id: activity?.contact?.hashed_id,
          })}
        >
          {activity?.contact?.label}
        </Link>
      ),
      notes: activity?.notes && (
        <>
          <br />'{activity?.notes}'
        </>
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

export function QuoteSlider() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const actions = useActions({
    showCommonBulkAction: true,
    showEditAction: true,
  });

  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const getSetting = useGetSetting();
  const getTimezone = useGetTimezone();
  const dateTime = useDateTime({ withTimezone: true, formatOnlyDate: true });

  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();
  const activityElement = useGenerateActivityElement();

  const [quote, setQuote] = useAtom(quoteSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(quoteSliderVisibilityAtom);

  const [commentsOnly, setCommentsOnly] = useState<boolean>(false);
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
        quote && (hasPermission('edit_quote') || entityAssigned(quote)) ? (
          <ResourceActions
            label={t('actions')}
            resource={quote}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('history'), t('activity'), t('email_history')]}
        width="full"
        withHorizontalPadding
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('quote_amount')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {quote
                ? formatMoney(
                    quote?.amount,
                    quote.client?.country_id,
                    quote.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('balance_due')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {quote
                ? formatMoney(
                    quote.balance,
                    quote.client?.country_id,
                    quote.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('date')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {quote ? date(quote?.date, dateFormat) : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('valid_until')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {quote ? date(quote.due_date, dateFormat) : null}
            </Element>

            <Element
              leftSide={t('status')}
              pushContentToRight
              noExternalPadding
            >
              {quote ? <QuoteStatus entity={quote} /> : null}
            </Element>
          </div>

          <Divider withoutPadding borderColor={colors.$20} />

          <div className="flex space-x-4 items-center justify-center px-6 py-5">
            <PortalCard
              className="flex flex-col items-center justify-center space-y-2 shadow-sm border px-14 py-5 cursor-pointer rounded-md"
              onClick={() => (quote ? openClientPortal(quote) : null)}
              style={{
                borderColor: colors.$20,
              }}
              theme={{
                backgroundColor: colors.$1,
                hoverBackgroundColor: colors.$4,
              }}
            >
              <CloudPlay
                color={colors.$17}
                filledColor={colors.$17}
                size="1.3rem"
              />

              <span
                className="font-medium whitespace-nowrap"
                style={{ color: colors.$3 }}
              >
                {t('view_portal')}
              </span>
            </PortalCard>

            {quote ? (
              <PortalCard
                className="flex flex-col items-center justify-center space-y-2 shadow-sm border px-14 py-5 cursor-pointer rounded-md"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateClientPortalUrl(quote) ?? ''
                  );

                  toast.success('copied_to_clipboard', { value: '' });
                }}
                style={{
                  borderColor: colors.$20,
                }}
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$4,
                }}
              >
                <CopyToClipboard
                  color={colors.$17}
                  filledColor={colors.$17}
                  size="1.3rem"
                />

                <span
                  className="font-medium whitespace-nowrap"
                  style={{ color: colors.$3 }}
                >
                  {t('copy_link')}
                </span>
              </PortalCard>
            ) : null}
          </div>

          <Divider withoutPadding borderColor={colors.$20} />

          {quote && quote.next_send_date ? (
            <>
              <div className="space-y-2 whitespace-nowrap px-6">
                <Tooltip
                  size="regular"
                  width="auto"
                  tooltipElement={
                    <article
                      className={classNames('prose prose-sm', {
                        'prose-invert': !reactSettings?.dark_mode,
                      })}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(
                          (resource?.reminder_schedule as string) ?? ''
                        ),
                      }}
                    />
                  }
                >
                  <h3 className="flex mt-2 italic">
                    {t('reminders')} <MdInfo className="mt-1 ml-1" />
                  </h3>
                </Tooltip>

                <Element
                  className="border-b border-dashed"
                  leftSide={t('next_send_date')}
                  pushContentToRight
                  noExternalPadding
                  withoutWrappingLeftSide
                  style={{ borderColor: colors.$20 }}
                >
                  {quote
                    ? dateTime(
                        quote.next_send_date,
                        '',
                        '',
                        getTimezone(getSetting(quote.client, 'timezone_id'))
                          .timeZone
                      )
                    : null}
                </Element>

                <Element
                  className="border-b border-dashed"
                  leftSide={t('reminder_last_sent')}
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  {quote ? date(quote.reminder_last_sent, dateFormat) : null}
                </Element>

                {quote.reminder1_sent ? (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('first_reminder')}
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {quote ? date(quote.reminder1_sent, dateFormat) : null}
                  </Element>
                ) : null}

                {quote.reminder2_sent ? (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('second_reminder')}
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {quote ? date(quote.reminder2_sent, dateFormat) : null}
                  </Element>
                ) : null}

                {quote.reminder3_sent ? (
                  <Element
                    leftSide={t('third_reminder')}
                    pushContentToRight
                    noExternalPadding
                  >
                    {quote ? date(quote.reminder3_sent, dateFormat) : null}
                  </Element>
                ) : null}
              </div>

              <Divider withoutPadding borderColor={colors.$20} />
            </>
          ) : null}

          {invoiceResponse && (
            <div className="flex flex-col space-y-4 px-6 py-5">
              <InvoiceBox
                className="flex flex-col items-start justify-center space-y-2 shadow-sm text-sm border p-5 w-full cursor-pointer rounded-md"
                onClick={() => {
                  !disableNavigation('invoice', invoiceResponse) &&
                    navigate(
                      route('/invoices/:id/edit', {
                        id: invoiceResponse.id,
                      })
                    );
                }}
                style={{
                  borderColor: colors.$20,
                }}
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$4,
                }}
              >
                <span className="font-medium" style={{ color: colors.$3 }}>
                  {t('invoice')} {invoiceResponse.number}
                </span>

                <div
                  className="inline-flex items-center space-x-1"
                  style={{ color: colors.$17 }}
                >
                  <span>
                    {formatMoney(
                      invoiceResponse.amount,
                      invoiceResponse.client?.country_id,
                      invoiceResponse.client?.settings.currency_id
                    )}
                  </span>

                  <span>-</span>

                  <span>{date(invoiceResponse.date, dateFormat)}</span>
                </div>

                <div>
                  <InvoiceStatus entity={invoiceResponse} />
                </div>
              </InvoiceBox>
            </div>
          )}
        </div>

        <div>
          {resource?.activities &&
            resource.activities.filter(({ history }) => history?.id).length ===
              0 && <NonClickableElement>{t('api_404')}</NonClickableElement>}

          {Boolean(resource?.activities?.length) && (
            <div className="flex flex-col px-3">
              {resource?.activities &&
                resource.activities
                  .filter(({ history }) => history?.id)
                  .map((activity) => (
                    <HistoryBox
                      className="flex items-center justify-start p-4 space-x-3 rounded-md cursor-pointer"
                      key={activity.id}
                      onClick={() =>
                        navigate(
                          route('/activities/:id', {
                            id: activity.id,
                          })
                        )
                      }
                      theme={{
                        backgroundColor: colors.$1,
                        hoverBackgroundColor: colors.$25,
                      }}
                    >
                      <div
                        className="p-2 rounded-full"
                        style={{ backgroundColor: colors.$20 }}
                      >
                        <History
                          size="1.3rem"
                          color={colors.$16}
                          filledColor={colors.$16}
                        />
                      </div>

                      <div className="flex flex-col items-start space-y-0.5 justify-center">
                        <div className="flex space-x-1 text-sm">
                          <span style={{ color: colors.$3 }}>
                            {quote?.client
                              ? formatMoney(
                                  activity.history.amount,
                                  quote?.client?.country_id,
                                  quote?.client?.settings.currency_id
                                )
                              : null}
                          </span>

                          <div>
                            <ArrowRight color={colors.$17} size="1.1rem" />
                          </div>

                          <DynamicLink
                            to={`/clients/${activity.client_id}`}
                            renderSpan={disableNavigation(
                              'client',
                              quote?.client
                            )}
                          >
                            {quote?.client?.display_name}
                          </DynamicLink>
                        </div>

                        <div
                          className="flex items-center space-x-1 text-xs"
                          style={{ color: colors.$17 }}
                        >
                          <span>
                            {date(
                              activity.created_at,
                              `${dateFormat} ${timeFormat}`
                            )}
                          </span>

                          <span>
                            {dayjs.unix(activity.created_at).fromNow()}
                          </span>
                        </div>
                      </div>
                    </HistoryBox>
                  ))}
            </div>
          )}
        </div>

        <div>
          <div
            className="flex items-center border-b px-6 pb-4 justify-between"
            style={{ borderColor: colors.$20 }}
          >
            <Toggle
              label={t('comments_only')}
              checked={commentsOnly}
              onValueChange={(value) => setCommentsOnly(value)}
            />

            <AddActivityComment
              entity="quote"
              entityId={resource?.id}
              label={resource?.number || ''}
            />
          </div>

          <div className="flex flex-col pt-3 px-3">
            {activities
              ?.filter(
                (activity) =>
                  (commentsOnly && activity.activity_type_id === 141) ||
                  !commentsOnly
              )
              .map((activity) => (
                <ActivityBox
                  key={activity.id}
                  className="flex space-x-3 p-4 rounded-md flex-1 min-w-0"
                  theme={{
                    backgroundColor: colors.$1,
                    hoverBackgroundColor: colors.$25,
                  }}
                >
                  <div className="flex items-center justify-center">
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: colors.$20 }}
                    >
                      <SquareActivityChart
                        size="1.3rem"
                        color={colors.$16}
                        filledColor={colors.$16}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                    <div className="text-sm" style={{ color: colors.$3 }}>
                      {activityElement(activity)}
                    </div>

                    <div
                      className="flex w-full items-center space-x-1 text-xs truncate"
                      style={{ color: colors.$17 }}
                    >
                      <span className="whitespace-nowrap">
                        {date(
                          activity.created_at,
                          `${dateFormat} ${timeFormat}`
                        )}
                      </span>

                      <span>-</span>

                      <span>{activity.ip}</span>
                    </div>
                  </div>
                </ActivityBox>
              ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2 px-6">
          {Boolean(!emailRecords.length) && (
            <span className="text-sm px-4" style={{ color: colors.$3 }}>
              {t('email_history_empty')}
            </span>
          )}

          {emailRecords.map((emailRecord, index) => (
            <EmailRecord
              key={index}
              className="py-4"
              emailRecord={emailRecord}
              index={index}
              withAllBorders
            />
          ))}
        </div>
      </TabGroup>
    </Slider>
  );
}
