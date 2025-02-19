/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Bell, Trash } from 'react-feather';
import { Slider } from './cards/Slider';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { GenericMessage, useSocketEvent } from '$app/common/queries/sockets';
import { Invoice } from '$app/common/interfaces/invoice';
import { route } from '$app/common/helpers/route';
import { ClickableElement } from './cards';
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

export interface Notification {
  label: string;
  date: string;
  link: string | null;
  readAt: string | null;
}

export const notificationsAtom = atomWithStorage<Notification[]>(
  'notifications',
  []
);

export function Notifications() {
  const { t } = useTranslation();

  const { timeFormat } = useCompanyTimeFormat();

  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  const colors = useColorScheme();
  const companyUser = useCurrentCompanyUser();

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
          date: new Date().toString(),
          link: route('/invoices/:id/edit', { id: $invoice.id }),
          readAt: null,
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
          date: new Date().toString(),
          link: route('/invoices/:id/edit', { id: $invoice.id }),
          readAt: null,
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
          label: `${t('credit_created')}: ${$credit.number}`,
          date: new Date().toString(),
          link: route('/credits/:id/edit', { id: $credit.id }),
          readAt: null,
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
          date: new Date().toString(),
          link: route('/credits/:id/edit', { id: $credit.id }),
          readAt: null,
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
          date: new Date().toString(),
          link: route('/payments/:id/edit', { id: payment.id }),
          readAt: null,
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
            date: new Date().toString(),
            link: message.link,
            readAt: null,
          };

          setNotifications((notifications) => [...notifications, notification]);
        }
      );

      return () => {
        channel.unbind('App\\Events\\General\\GenericMessage');
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
          <button type="button" onClick={() => setNotifications([])}>
            <Trash size={18} />
          </button>
        }
      >
        {notifications.map((notification, i) =>
          notification.link ? (
            <ClickableElement key={i} to={notification.link}>
              <div>
                <p>{notification.label}</p>
                <p className="text-xs">
                  {date(
                    notification.date,
                    `${dateFormat.dateFormat} ${timeFormat}`
                  )}
                </p>
              </div>
            </ClickableElement>
          ) : (
            <NonClickableElement key={i}>
              <p>{notification.label}</p>
              <p className="text-xs">
                {date(
                  notification.date,
                  `${dateFormat.dateFormat} ${timeFormat}`
                )}
              </p>
            </NonClickableElement>
          )
        )}

        {notifications.length === 0 ? (
          <NonClickableElement>
            {t('no_unread_notifications')}
          </NonClickableElement>
        ) : null}
      </Slider>
    </>
  );
}
