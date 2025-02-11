/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Bell } from 'react-feather';
import { Slider } from './cards/Slider';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { GenericMessage, useSocketEvent } from '$app/common/queries/sockets';
import { Invoice } from '$app/common/interfaces/invoice';
import { route } from '$app/common/helpers/route';
import { date, isHosted, isSelfHosted, trans } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { NonClickableElement } from './cards/NonClickableElement';
import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { Credit } from '$app/common/interfaces/credit';
import { Payment } from '$app/common/interfaces/payment';
import classNames from 'classnames';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useSockets } from '$app/common/hooks/useSockets';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Icon } from './icons/Icon';
import { useColorScheme } from '$app/common/colors';
import { Button, Link } from './forms';
import { useReplaceVariables } from '$app/common/hooks/useReplaceTranslationVariables';
import { CardCheck } from './icons/CardCheck';
import { GoDotFill } from 'react-icons/go';
import { CardChange } from './icons/CardChange';
import { FileSearch } from './icons/FileSearch';
import { FileAdd } from './icons/FileAdd';
import { FileEdit } from './icons/FileEdit';
export interface Notification {
  label: string;
  displayLabel: ReactNode;
  date: string;
  link: string | null;
  readAt: string | null;
  icon?: ReactNode;
}

export const notificationsAtom = atomWithStorage<Notification[]>(
  'notifications',
  []
);

export function Notifications() {
  const { t } = useTranslation();

  const { timeFormat } = useCompanyTimeFormat();

  const replaceVariables = useReplaceVariables();

  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  const colors = useColorScheme();
  const companyUser = useCurrentCompanyUser();

  const randomNotifications: Notification[] = [
    {
      label: 'Payment updated: #PAY-002',
      displayLabel: (
        <div className="flex items-center space-x-1">
          <span>{t('payment_updated')}:</span>
          <Link to={route('/payments/:id/edit', { id: '2' })}>#1002</Link>
        </div>
      ),
      date: new Date(Date.now() - 259200000).toString(),
      link: route('/payments/:id/edit', { id: '2' }),
      readAt: new Date(Date.now() - 172800000).toString(),
      icon: (
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.$5 }}
        >
          <CardChange size="1.3rem" color={colors.$3} />
        </div>
      ),
    },
  ];

  useSocketEvent({
    on: [
      'App\\Events\\Invoice\\InvoiceWasPaid',
      'App\\Events\\Invoice\\InvoiceWasViewed',
      'App\\Events\\Credit\\CreditWasCreated',
      'App\\Events\\Credit\\CreditWasUpdated',
      'App\\Events\\Payment\\PaymentWasUpdated',
    ],
    callback: ({ event, data }) => {
      if (event === 'App\\Events\\Invoice\\InvoiceWasPaid') {
        const $invoice = data as Invoice;

        const notification = {
          label: `${$invoice.number}: ${t('invoice_paid')}`,
          displayLabel: replaceVariables(
            t('notification_invoice_paid_subject') as string,
            {
              invoice: (
                <Link to={route('/invoices/:id/edit', { id: $invoice.id })}>
                  {`#${$invoice.number}`}
                </Link>
              ),

              client: (
                <Link to={route('/clients/:id', { id: $invoice.client_id })}>
                  {$invoice.client?.display_name}
                </Link>
              ),
            }
          ),
          date: new Date().toString(),
          link: route('/invoices/:id/edit', { id: $invoice.id }),
          readAt: null,
          icon: (
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.$5 }}
            >
              <CardCheck size="1.3rem" color={colors.$3} />
            </div>
          ),
        };

        if (
          notifications.some((n) => n.label === notification.label) ||
          notifications.some((n) => n.link === notification.link)
        ) {
          return;
        }

        setNotifications((notifications) => [...notifications, notification]);
      }

      if (event === 'App\\Events\\Invoice\\InvoiceWasViewed') {
        if (
          !companyUser?.notifications.email.includes('invoice_viewed') ||
          !companyUser?.notifications.email.includes('invoice_viewed_user')
        ) {
          return;
        }

        const $invoice = data as Invoice;

        const notification = {
          label: trans('notification_invoice_viewed_subject', {
            invoice: $invoice.number,
            client: $invoice.client?.display_name,
          }),
          displayLabel: replaceVariables(
            t('notification_invoice_viewed_subject') as string,
            {
              invoice: (
                <Link to={route('/invoices/:id/edit', { id: $invoice.id })}>
                  {`#${$invoice.number}`}
                </Link>
              ),

              client: (
                <Link to={route('/clients/:id', { id: $invoice.client_id })}>
                  {$invoice.client?.display_name}
                </Link>
              ),
            }
          ),
          date: new Date().toString(),
          link: route('/invoices/:id/edit', { id: $invoice.id }),
          readAt: null,
          icon: (
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.$5 }}
            >
              <FileSearch size="1.3rem" color={colors.$3} />
            </div>
          ),
        };

        if (
          notifications.some((n) => n.label === notification.label) ||
          notifications.some((n) => n.link === notification.link)
        ) {
          return;
        }

        setNotifications((notifications) => [...notifications, notification]);
      }

      if (event === 'App\\Events\\Credit\\CreditWasCreated') {
        const $credit = data as Credit;

        const notification = {
          label: trans('notification_credit_created_subject', {
            invoice: $credit.number,
            client: $credit.client?.display_name,
          }),
          displayLabel: replaceVariables(
            t('notification_credit_created_subject') as string,
            {
              invoice: (
                <Link to={route('/credits/:id/edit', { id: $credit.id })}>
                  {`#${$credit.number}`}
                </Link>
              ),

              client: (
                <Link to={route('/clients/:id', { id: $credit.client_id })}>
                  {$credit.client?.display_name}
                </Link>
              ),
            }
          ),
          date: new Date().toString(),
          link: route('/credits/:id/edit', { id: $credit.id }),
          readAt: null,
          icon: (
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.$5 }}
            >
              <FileAdd size="1.3rem" color={colors.$3} />
            </div>
          ),
        };

        if (
          notifications.some((n) => n.label === notification.label) ||
          notifications.some((n) => n.link === notification.link)
        ) {
          return;
        }

        setNotifications((notifications) => [...notifications, notification]);
      }

      if (event === 'App\\Events\\Credit\\CreditWasUpdated') {
        const $credit = data as Credit;

        const notification = {
          label: `${t('credit_updated')}: ${$credit.number}`,
          displayLabel: (
            <div className="flex items-center space-x-1">
              <span>{t('credit_updated')}:</span>

              <Link to={route('/credits/:id/edit', { id: $credit.id })}>
                {`#${$credit.number}`}
              </Link>
            </div>
          ),
          date: new Date().toString(),
          link: route('/credits/:id/edit', { id: $credit.id }),
          readAt: null,
          icon: (
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.$5 }}
            >
              <FileEdit size="1.3rem" color={colors.$3} />
            </div>
          ),
        };

        if (
          notifications.some((n) => n.label === notification.label) ||
          notifications.some((n) => n.link === notification.link)
        ) {
          return;
        }

        setNotifications((notifications) => [...notifications, notification]);
      }

      if (event === 'App\\Events\\Payment\\PaymentWasUpdated') {
        const payment = data as Payment;

        const notification = {
          label: `${t('payment_updated')}: ${payment.number}`,
          displayLabel: (
            <div className="flex items-center space-x-1">
              <span>{t('payment_updated')}:</span>

              <Link to={route('/payments/:id/edit', { id: payment.id })}>
                {`#${payment.number}`}
              </Link>
            </div>
          ),
          date: new Date().toString(),
          link: route('/payments/:id/edit', { id: payment.id }),
          readAt: null,
          icon: (
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.$5 }}
            >
              <CardChange size="1.3rem" color={colors.$3} />
            </div>
          ),
        };

        if (
          notifications.some((n) => n.label === notification.label) ||
          notifications.some((n) => n.link === notification.link)
        ) {
          return;
        }

        setNotifications((notifications) => [...notifications, notification]);
      }
    },
  });

  const sockets = useSockets();
  const dateFormat = useCurrentCompanyDateFormats();
  const reactSettings = useReactSettings();

  useEffect(() => {
    if (
      isSelfHosted() &&
      !reactSettings.preferences.enable_public_notifications
    ) {
      return;
    }

    if (sockets) {
      const channelName = isHosted() ? 'general_hosted' : 'general_selfhosted';
      const channel = sockets.subscribe(channelName);

      channel.bind(
        'App\\Events\\General\\GenericMessage',
        (message: GenericMessage) => {
          const notification = {
            label: message.message,
            displayLabel: message.message,
            date: new Date().toString(),
            link: message.link,
            readAt: null,
          };

          setNotifications((notifications) => [...notifications, notification]);
        }
      );

      return () => {
        sockets.channel(channelName).unsubscribe();
      };
    }
  }, [sockets, reactSettings.preferences.enable_public_notifications]);

  if (
    isSelfHosted() &&
    !reactSettings.preferences.enable_public_notifications
  ) {
    return null;
  }

  return (
    <>
      <div className="relative mt-2 mr-1">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={classNames({
            'animate-jiggle': notifications.length > 0,
          })}
        >
          <Icon className="w-5 h-5" element={Bell} color={colors.$3} />

          {notifications.length > 0 ? (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-white border-2 bg-blue-500"></span>
          ) : null}
        </button>
      </div>

      <Slider
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        size="regular"
        title={t('notifications')!}
        topRight={
          <Button
            type="minimal"
            behavior="button"
            className="rounded-md"
            onClick={() => setNotifications([])}
          >
            {t('clear')}
          </Button>
        }
        withoutDivider
      >
        {randomNotifications.length > 0 ? (
          <div className="flex flex-col space-y-2 pt-2">
            {randomNotifications.map((notification, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-2 space-x-2"
              >
                <div className="flex items-center space-x-2.5">
                  {notification.icon}

                  <div className="flex flex-col space-y-0.5">
                    <div
                      className="text-sm"
                      style={{
                        color: colors.$3,
                      }}
                    >
                      {notification.displayLabel}
                    </div>

                    <p className="text-xs text-gray-500">
                      {date(
                        notification.date,
                        `${dateFormat.dateFormat} ${timeFormat}`
                      )}
                    </p>
                  </div>
                </div>

                {!notification.readAt && (
                  <div>
                    <Icon element={GoDotFill} size={14} color="#2176FF" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <NonClickableElement>
            {t('no_unread_notifications')}
          </NonClickableElement>
        )}
      </Slider>
    </>
  );
}
