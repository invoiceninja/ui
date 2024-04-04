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
import { ClickableElement, Element } from '$app/components/cards';
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
import { Inline } from '$app/components/Inline';
import { Icon } from '$app/components/icons/Icon';
import { MdCloudCircle, MdOutlineContentCopy } from 'react-icons/md';
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

export const recurringInvoiceSliderAtom = atom<RecurringInvoice | null>(null);
export const recurringInvoiceSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

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

  const dateTime = useDateTime();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();

  const formatMoney = useFormatMoney();
  const actions = useActions({
    showCommonBulkActions: true,
    showEditAction: true,
  });

  const { dateFormat } = useCurrentCompanyDateFormats();

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

  const activityElement = useGenerateActivityElement();

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
            label={t('more_actions')}
            resource={recurringInvoice}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
    >
      <TabGroup
        tabs={[t('overview'), t('history'), t('schedule'), t('activity')]}
        width="full"
      >
        <div className="space-y-2">
          <div>
            <Element leftSide={t('invoice_amount')}>
              {recurringInvoice
                ? formatMoney(
                    recurringInvoice?.amount || 0,
                    recurringInvoice.client?.country_id,
                    recurringInvoice.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('balance_due')}>
              {recurringInvoice
                ? formatMoney(
                    recurringInvoice.balance || 0,
                    recurringInvoice.client?.country_id,
                    recurringInvoice.client?.settings.currency_id
                  )
                : null}
            </Element>

            {recurringInvoice && recurringInvoice.next_send_date ? (
              <Element leftSide={t('next_send_date')}>
                {recurringInvoice
                  ? dateTime(recurringInvoice.next_send_datetime)
                  : null}
              </Element>
            ) : null}

            <Element leftSide={t('frequency')}>
              {t(
                frequencies[
                  recurringInvoice?.frequency_id as keyof typeof frequencies
                ]
              )}
            </Element>

            <Element leftSide={t('remaining_cycles')} withoutWrappingLeftSide>
              {recurringInvoice?.remaining_cycles === -1
                ? t('endless')
                : recurringInvoice?.remaining_cycles}
            </Element>

            <Element leftSide={t('auto_bill')}>
              {t(recurringInvoice?.auto_bill || '')}
            </Element>

            <Element leftSide={t('status')}>
              {recurringInvoice ? (
                <RecurringInvoiceStatus entity={recurringInvoice} />
              ) : null}
            </Element>
          </div>

          <Divider withoutPadding />

          <Inline className="w-full">
            <ClickableElement
              className="text-center"
              onClick={() =>
                recurringInvoice ? openClientPortal(recurringInvoice) : null
              }
            >
              <div className="inline-flex items-center space-x-1">
                <Icon element={MdCloudCircle} />
                <p>{t('view_portal')}</p>
              </div>
            </ClickableElement>

            {recurringInvoice ? (
              <ClickableElement
                className="text-center"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateClientPortalUrl(recurringInvoice) ?? ''
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
                to={route('/activities/:id', { id: activity.id })}
              >
                <div className="flex flex-col">
                  <div className="flex space-x-1">
                    <span>
                      {recurringInvoice?.client
                        ? formatMoney(
                            activity.history.amount || 0,
                            recurringInvoice?.client?.country_id,
                            recurringInvoice?.client?.settings.currency_id
                          )
                        : null}
                    </span>
                    <span>&middot;</span>
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
          <div className="flex px-6 pt-2 pb-3 font-medium text-sm">
            <span className="w-1/2">{t('send_date')}</span>
            <span className="w-1/2">{t('due_date')}</span>
          </div>

          {resource?.recurring_dates.map((recurringDate, index) => (
            <div key={index} className="flex px-6 py-2 text-sm">
              <span className="w-1/2">
                {date(recurringDate.send_date, dateFormat)}
              </span>
              <span className="w-1/2">
                {date(recurringDate.due_date, dateFormat)}
              </span>
            </div>
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
      </TabGroup>
    </Slider>
  );
};
