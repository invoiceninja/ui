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
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Link } from '$app/components/forms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { route } from '$app/common/helpers/route';
import reactStringReplace from 'react-string-replace';
import { useActions } from '../hooks';
import {
  generateClientPortalUrl,
  openClientPortal,
} from '$app/pages/invoices/common/helpers/open-client-portal';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { RecurringInvoiceStatus } from './RecurringInvoiceStatus';
import { RecurringInvoiceActivity } from '$app/common/interfaces/recurring-invoice-activity';
import frequencies from '$app/common/constants/frequency';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useDateTime } from '$app/common/hooks/useDateTime';
import Toggle from '$app/components/forms/Toggle';
import { AddActivityComment } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { useState } from 'react';
import { useColorScheme } from '$app/common/colors';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { useGetTimezone } from '$app/common/hooks/useGetTimezone';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CloudPlay } from '$app/components/icons/CloudPlay';
import { CopyToClipboard } from '$app/components/icons/CopyToClipboard';
import { History } from '$app/components/icons/History';
import { SquareActivityChart } from '$app/components/icons/SquareActivityChart';
import { ArrowRight } from '$app/components/icons/ArrowRight';

export const recurringInvoiceSliderAtom = atom<RecurringInvoice | null>(null);
export const recurringInvoiceSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export const useGenerateActivityElement = () => {
  const [t] = useTranslation();

  return (activity: RecurringInvoiceActivity) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {activity.client?.label}
        </Link>
      ),
      invoice: (
        <Link
          to={route('/invoices/:id/edit', { id: activity?.invoice?.hashed_id })}
        >
          {activity?.invoice?.label}
        </Link>
      ),
      user: activity.user?.label ?? t('system'),
      recurring_invoice: (
        <Link
          to={route('/recurring_invoices/:id/edit', {
            id: activity.recurring_invoice?.hashed_id,
          })}
        >
          {activity?.recurring_invoice?.label}
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
};

export const RecurringInvoiceSlider = () => {
  const [isVisible, setIsSliderVisible] = useAtom(
    recurringInvoiceSliderVisibilityAtom
  );
  const [recurringInvoice, setRecurringInvoice] = useAtom(
    recurringInvoiceSliderAtom
  );
  const [t] = useTranslation();

  const colors = useColorScheme();
  const navigate = useNavigate();

  const getSetting = useGetSetting();
  const getTimezone = useGetTimezone();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();
  const activityElement = useGenerateActivityElement();
  const dateTime = useDateTime({ withTimezone: true });

  const formatMoney = useFormatMoney();
  const actions = useActions({
    showCommonBulkActions: true,
    showEditAction: true,
  });

  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [commentsOnly, setCommentsOnly] = useState<boolean>(false);

  const { data: resource } = useQuery({
    queryKey: ['/api/v1/recurring_invoices', recurringInvoice?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/recurring_invoices/:id?include=activities.history&show_dates=true',
          { id: recurringInvoice?.id }
        )
      ).then(
        (response: GenericSingleResourceResponse<RecurringInvoice>) =>
          response.data.data
      ),
    enabled: recurringInvoice !== null && isVisible,
    staleTime: Infinity,
  });

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities/entity', recurringInvoice?.id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'recurring_invoice',
        entity_id: recurringInvoice?.id,
      }).then(
        (
          response: AxiosResponse<GenericManyResponse<RecurringInvoiceActivity>>
        ) => response.data.data
      ),
    enabled: recurringInvoice !== null && isVisible,
    staleTime: Infinity,
  });

  return (
    <Slider
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setRecurringInvoice(null);
      }}
      size="regular"
      title={`${t('recurring_invoice')} ${recurringInvoice?.number || ''}`}
      topRight={
        recurringInvoice &&
        (hasPermission('edit_recurring_invoice') ||
          entityAssigned(recurringInvoice)) ? (
          <ResourceActions
            label={t('actions')}
            resource={recurringInvoice}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('history'), t('schedule'), t('activity')]}
        width="full"
        withHorizontalPadding
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('invoice_amount')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {recurringInvoice
                ? formatMoney(
                    recurringInvoice?.amount || 0,
                    recurringInvoice.client?.country_id,
                    recurringInvoice.client?.settings.currency_id
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
              {recurringInvoice
                ? formatMoney(
                    recurringInvoice.balance || 0,
                    recurringInvoice.client?.country_id,
                    recurringInvoice.client?.settings.currency_id
                  )
                : null}
            </Element>

            {recurringInvoice && recurringInvoice.next_send_date ? (
              <Element
                className="border-b border-dashed"
                leftSide={t('next_send_date')}
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {recurringInvoice
                  ? dateTime(
                      recurringInvoice.next_send_datetime,
                      '',
                      '',
                      getTimezone(
                        getSetting(recurringInvoice.client, 'timezone_id')
                      ).timeZone
                    )
                  : null}
              </Element>
            ) : null}

            <Element
              className="border-b border-dashed"
              leftSide={t('frequency')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {t(
                frequencies[
                  recurringInvoice?.frequency_id as keyof typeof frequencies
                ]
              )}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('remaining_cycles')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {recurringInvoice?.remaining_cycles === -1
                ? t('endless')
                : recurringInvoice?.remaining_cycles}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('auto_bill')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {t(recurringInvoice?.auto_bill || '')}
            </Element>

            <Element
              leftSide={t('status')}
              pushContentToRight
              noExternalPadding
            >
              {recurringInvoice ? (
                <RecurringInvoiceStatus entity={recurringInvoice} />
              ) : null}
            </Element>
          </div>

          <Divider withoutPadding borderColor={colors.$20} />

          <div className="flex space-x-4 items-center justify-center px-6 py-5">
            <Box
              className="flex flex-col items-center justify-center space-y-2 shadow-sm border px-14 py-5 cursor-pointer rounded-md"
              onClick={() =>
                recurringInvoice ? openClientPortal(recurringInvoice) : null
              }
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
            </Box>

            {recurringInvoice ? (
              <Box
                className="flex flex-col items-center justify-center space-y-2 shadow-sm border px-14 py-5 cursor-pointer rounded-md"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateClientPortalUrl(recurringInvoice) ?? ''
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
              </Box>
            ) : null}
          </div>
        </div>

        <div>
          {resource?.activities && resource.activities.length === 0 && (
            <NonClickableElement>{t('api_404')}</NonClickableElement>
          )}

          {Boolean(resource?.activities?.length) && (
            <div className="flex flex-col px-3">
              {resource?.activities &&
                resource.activities.map((activity) => (
                  <Box
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
                          {recurringInvoice?.client
                            ? formatMoney(
                                activity.history.amount || 0,
                                recurringInvoice?.client?.country_id,
                                recurringInvoice?.client?.settings.currency_id
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
                            recurringInvoice?.client
                          )}
                        >
                          {recurringInvoice?.client?.display_name}
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

                        <span>{dayjs.unix(activity.created_at).fromNow()}</span>
                      </div>
                    </div>
                  </Box>
                ))}
            </div>
          )}
        </div>

        <div>
          <div
            className="flex px-6 pt-2 pb-3 font-medium text-sm"
            style={{ color: colors.$22 }}
          >
            <span className="w-1/2">{t('send_date')}</span>
            <span className="w-1/2">{t('due_date')}</span>
          </div>

          <div className="px-6">
            {resource?.recurring_dates.map((recurringDate, index) => (
              <div
                key={index}
                className="flex py-2 text-sm border-b border-dashed"
                style={{
                  borderColor:
                    index === resource.recurring_dates.length - 1
                      ? 'transparent'
                      : colors.$20,
                }}
              >
                <span className="w-1/2" style={{ color: colors.$3 }}>
                  {date(recurringDate.send_date, dateFormat)}
                </span>

                <span className="w-1/2" style={{ color: colors.$3 }}>
                  {date(recurringDate.due_date, dateFormat)}
                </span>
              </div>
            ))}
          </div>
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
              entity="recurring_invoice"
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
                <Box
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
                </Box>
              ))}
          </div>
        </div>
      </TabGroup>
    </Slider>
  );
};
