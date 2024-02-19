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
import { useQuery, useQueryClient } from 'react-query';
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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useActions } from '../hooks';
import { EmailRecord } from '$app/components/EmailRecord';
import { useEffect, useState } from 'react';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { QuoteActivity } from '$app/common/interfaces/quote-activity';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { InvoiceStatus } from '$app/pages/invoices/common/components/InvoiceStatus';
import { TaskStatus } from './TaskStatus';
import { Task } from '$app/common/interfaces/task';
import { TaskActivity } from '$app/common/interfaces/task-activity';

export const taskSliderAtom = atom<Task | null>(null);
export const taskSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

function useGenerateActivityElement() {
  const [t] = useTranslation();

  return (activity: TaskActivity) => {
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

export function TaskSlider() {
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

  const [task, setTask] = useAtom(taskSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(taskSliderVisibilityAtom);

  const [emailRecords, setEmailRecords] = useState<EmailRecordType[]>([]);

  const { data: invoiceResponse } = useInvoiceQuery({ id: task?.invoice_id });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: resource } = useQuery({
    queryKey: ['/api/v1/tasks', task?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/tasks/${task?.id}?include=activities.history&reminder_schedule=true`
        )
      ).then(
        (response: GenericSingleResourceResponse<Task>) => response.data.data
      ),
    enabled: task !== null && isVisible,
    staleTime: Infinity,
  });

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities', task?.id, 'quote'],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'quote',
        entity_id: task?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<QuoteActivity>>) =>
          response.data.data
      ),
    enabled: task !== null && isVisible,
    staleTime: Infinity,
  });

  const fetchEmailHistory = async () => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/quotes', task?.id, 'emailHistory'],
        () =>
          request('POST', endpoint('/api/v1/emails/entityHistory'), {
            entity: 'quote',
            entity_id: task?.id,
          }),
        { staleTime: Infinity }
      )
      .then((response) => response.data);

    setEmailRecords(response);
  };

  useEffect(() => {
    if (task) {
      fetchEmailHistory();
    }
  }, [task]);

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setTask(null);
      }}
      title={`${t('task')} ${task?.number}`}
      topRight={
        task &&
        (hasPermission('edit_task') || entityAssigned(task)) && (
          <ResourceActions
            label={t('more_actions')}
            resource={task}
            actions={actions}
          />
        )
      }
      withoutActionContainer
    >
      <TabGroup
        tabs={[t('overview'), t('activity'), t('email_history')]}
        width="full"
      >
        <div className="space-y-2">
          <div>
            <Element leftSide={t('quote_amount')}>12222</Element>

            <Element leftSide={t('balance_due')}>12222</Element>

            <Element leftSide={t('date')}>
              {task ? date(task?.date, dateFormat) : null}
            </Element>

            <Element leftSide={t('status')}>
              {task ? <TaskStatus entity={task} /> : null}
            </Element>
          </div>

          <Divider withoutPadding />

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
