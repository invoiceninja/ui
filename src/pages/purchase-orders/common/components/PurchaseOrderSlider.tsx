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
import { date, endpoint } from '$app/common/helpers';
import { ResourceActions } from '$app/components/ResourceActions';
import { toast } from '$app/common/helpers/toast/toast';
import { useQuery, useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Upload } from '$app/pages/settings/company/documents/components';
import { $refetch } from '$app/common/hooks/useRefetch';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MdInfo } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { Tooltip } from '$app/components/Tooltip';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useActions } from '../hooks';
import { PurchaseOrderStatus } from './PurchaseOrderStatus';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Client } from '$app/common/interfaces/client';
import {
  generateClientPortalUrl,
  openClientPortal,
} from '$app/pages/invoices/common/helpers/open-client-portal';
import { EmailRecord } from '$app/components/EmailRecord';
import { useEffect, useState } from 'react';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { PurchaseOrderActivity } from '$app/common/interfaces/purchase-order-activity';
import { useExpenseQuery } from '$app/common/queries/expenses';
import { ExpenseStatus } from '$app/pages/expenses/common/components/ExpenseStatus';
import { ViewLineItem } from '$app/pages/invoices/common/components/ViewLineItem';
import { sanitizeHTML } from '$app/common/helpers/html-string';
import Toggle from '$app/components/forms/Toggle';
import { AddActivityComment } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { useColorScheme } from '$app/common/colors';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import classNames from 'classnames';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CloudPlay } from '$app/components/icons/CloudPlay';
import { CopyToClipboard } from '$app/components/icons/CopyToClipboard';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { History } from '$app/components/icons/History';
import { SquareActivityChart } from '$app/components/icons/SquareActivityChart';
import { ChevronRight } from 'react-feather';
import { Icon } from '$app/components/icons/Icon';
import { useGenerateActivityElement } from '../../edit/components/Activities';

export const purchaseOrderSliderAtom = atom<PurchaseOrder | null>(null);
export const purchaseOrderSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function PurchaseOrderSlider() {
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

  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();
  const activityElement = useGenerateActivityElement();

  const [purchaseOrder, setPurchaseOrder] = useAtom(purchaseOrderSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(
    purchaseOrderSliderVisibilityAtom
  );

  const [commentsOnly, setCommentsOnly] = useState<boolean>(false);
  const [emailRecords, setEmailRecords] = useState<EmailRecordType[]>([]);

  const { data: expenseResponse } = useExpenseQuery({
    id: purchaseOrder?.expense_id,
    enabled: Boolean(purchaseOrder?.expense_id),
  });

  const { data: resource } = useQuery({
    queryKey: ['/api/v1/purchase_orders', purchaseOrder?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/purchase_orders/${purchaseOrder?.id}?include=activities.history&reminder_schedule=true`
        )
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    enabled: purchaseOrder !== null && isVisible,
    staleTime: Infinity,
  });

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities', purchaseOrder?.id, 'purchase_order'],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'purchase_order',
        entity_id: purchaseOrder?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<PurchaseOrderActivity>>) =>
          response.data.data
      ),
    enabled: purchaseOrder !== null && isVisible,
    staleTime: Infinity,
  });

  const fetchEmailHistory = async () => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/purchase_orders', purchaseOrder?.id, 'emailHistory'],
        () =>
          request('POST', endpoint('/api/v1/emails/entityHistory'), {
            entity: 'purchase_order',
            entity_id: purchaseOrder?.id,
          }),
        { staleTime: Infinity }
      )
      .then((response) => response.data);

    setEmailRecords(response);
  };

  useEffect(() => {
    if (purchaseOrder) {
      fetchEmailHistory();
    }
  }, [purchaseOrder]);

  const vendorAsClient = purchaseOrder?.vendor
    ? ({
        country_id: purchaseOrder.vendor.country_id,
        settings: { currency_id: purchaseOrder.vendor.currency_id },
      } as unknown as Client)
    : undefined;

  return (
    <Slider
      size="large"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setPurchaseOrder(null);
      }}
      title={`${t('purchase_order')} ${purchaseOrder?.number}`}
      topRight={
        purchaseOrder &&
        (hasPermission('edit_purchase_order') ||
          entityAssigned(purchaseOrder)) ? (
          <ResourceActions
            label={t('actions')}
            resource={purchaseOrder}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[
          t('overview'),
          t('history'),
          t('activity'),
          t('email_history'),
          t('documents'),
        ]}
        width="full"
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 4) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={purchaseOrder?.documents?.length}
                textCenter
              />
            );
          }
        }}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('amount')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {purchaseOrder
                ? formatMoney(
                    purchaseOrder.amount,
                    purchaseOrder.vendor?.country_id,
                    purchaseOrder.vendor?.currency_id
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
              {purchaseOrder
                ? formatMoney(
                    purchaseOrder.balance,
                    purchaseOrder.vendor?.country_id,
                    purchaseOrder.vendor?.currency_id
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
              {purchaseOrder ? date(purchaseOrder.date, dateFormat) : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('due_date')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {purchaseOrder ? date(purchaseOrder.due_date, dateFormat) : null}
            </Element>

            <Element
              leftSide={t('status')}
              pushContentToRight
              noExternalPadding
            >
              {purchaseOrder ? (
                <PurchaseOrderStatus entity={purchaseOrder} />
              ) : null}
            </Element>
          </div>

          <Divider withoutPadding borderColor={colors.$20} />

          <div className="flex space-x-4 items-center justify-center px-6 py-5">
            <Box
              className="flex flex-col items-center justify-center space-y-2 shadow-sm border px-14 py-5 cursor-pointer rounded-md"
              onClick={() =>
                purchaseOrder ? openClientPortal(purchaseOrder) : null
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

            {purchaseOrder ? (
              <Box
                className="flex flex-col items-center justify-center space-y-2 shadow-sm border px-14 py-5 cursor-pointer rounded-md"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateClientPortalUrl(purchaseOrder) ?? ''
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

          <Divider withoutPadding borderColor={colors.$20} />

          {purchaseOrder && purchaseOrder.next_send_date ? (
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
                  {purchaseOrder
                    ? date(purchaseOrder.next_send_date, dateFormat)
                    : null}
                </Element>

                <Element
                  className="border-b border-dashed"
                  leftSide={t('reminder_last_sent')}
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  {purchaseOrder
                    ? date(purchaseOrder.reminder_last_sent, dateFormat)
                    : null}
                </Element>

                {purchaseOrder.reminder1_sent ? (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('first_reminder')}
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {date(purchaseOrder.reminder1_sent, dateFormat)}
                  </Element>
                ) : null}

                {purchaseOrder.reminder2_sent ? (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('second_reminder')}
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {date(purchaseOrder.reminder2_sent, dateFormat)}
                  </Element>
                ) : null}

                {purchaseOrder.reminder3_sent ? (
                  <Element
                    leftSide={t('third_reminder')}
                    pushContentToRight
                    noExternalPadding
                  >
                    {date(purchaseOrder.reminder3_sent, dateFormat)}
                  </Element>
                ) : null}
              </div>

              <Divider withoutPadding borderColor={colors.$20} />
            </>
          ) : null}

          {expenseResponse && (
            <div className="flex flex-col space-y-4 px-6 py-5">
              <Box
                className="flex flex-col items-start justify-center space-y-2 shadow-sm text-sm border p-5 w-full cursor-pointer rounded-md"
                onClick={() => {
                  !disableNavigation('expense', expenseResponse) &&
                    navigate(
                      route('/expenses/:id/edit', {
                        id: expenseResponse.id,
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
                  {t('expense')} {expenseResponse.number}
                </span>

                <div
                  className="inline-flex items-center space-x-1"
                  style={{ color: colors.$17 }}
                >
                  <span>
                    {formatMoney(
                      expenseResponse.amount,
                      purchaseOrder?.vendor?.country_id,
                      purchaseOrder?.vendor?.currency_id
                    )}
                  </span>

                  <span>-</span>

                  <span>{date(expenseResponse.date, dateFormat)}</span>
                </div>

                <div>
                  <ExpenseStatus entity={expenseResponse} />
                </div>
              </Box>
            </div>
          )}

          {Boolean(expenseResponse) &&
            Boolean(purchaseOrder?.line_items?.length) && (
              <Divider withoutPadding borderColor={colors.$20} />
            )}

          {purchaseOrder && Boolean(purchaseOrder.line_items?.length) && (
            <div className="flex flex-col space-y-3 px-6 py-5">
              {purchaseOrder.line_items.map((lineItem, index) => (
                <ViewLineItem
                  key={index}
                  lineItem={lineItem}
                  lineItemIndex={index}
                  client={vendorAsClient}
                  editHref={route('/purchase_orders/:id/edit', {
                    id: purchaseOrder.id,
                  })}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          {resource?.activities &&
            resource.activities.filter(({ history }) => history?.id).length ===
              0 && <NonClickableElement>{t('api_404')}</NonClickableElement>}

          {Boolean(resource?.activities?.length) && (
            <div className="flex flex-col px-3 gap-3">
              {resource?.activities &&
                resource.activities
                  .filter(({ history }) => history?.id)
                  .map((activity) => (
                    <Box
                      className="flex items-center justify-between p-4 rounded-md cursor-pointer"
                      key={activity.id}
                      onClick={() =>
                        navigate(
                          route('/activities/:id', {
                            id: activity.id,
                          })
                        )
                      }
                      theme={{
                        backgroundColor: colors.$4,
                        hoverBackgroundColor: colors.$15,
                      }}
                    >
                      <div className="flex items-center justify-start space-x-3">
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
                              {purchaseOrder?.vendor
                                ? formatMoney(
                                    activity.history.amount,
                                    purchaseOrder.vendor?.country_id,
                                    purchaseOrder.vendor?.currency_id
                                  )
                                : null}
                            </span>

                            <div>
                              <ArrowRight color={colors.$17} size="1.1rem" />
                            </div>

                            <DynamicLink
                              to={`/vendors/${purchaseOrder?.vendor_id}`}
                              renderSpan={disableNavigation(
                                'vendor',
                                purchaseOrder?.vendor
                              )}
                            >
                              {purchaseOrder?.vendor?.name}
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
                      </div>

                      <div>
                        <Icon
                          element={ChevronRight}
                          size={16}
                          color={colors.$17}
                        />
                      </div>
                    </Box>
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
              entity="purchase_order"
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

        <div className="px-4">
          <Upload
            endpoint={endpoint('/api/v1/purchase_orders/:id/upload', {
              id: purchaseOrder?.id,
            })}
            onSuccess={() => $refetch(['purchase_orders'])}
            widgetOnly
            disableUpload={
              !hasPermission('edit_purchase_order') &&
              !entityAssigned(purchaseOrder)
            }
          />

          <DocumentsTable
            documents={purchaseOrder?.documents || []}
            onDocumentDelete={() => $refetch(['purchase_orders'])}
            disableEditableOptions={
              !entityAssigned(purchaseOrder, true) &&
              !hasPermission('edit_purchase_order')
            }
          />
        </div>
      </TabGroup>
    </Slider>
  );
}
