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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useSocketEvent } from '$app/common/queries/sockets';
import { Invoice } from '$app/common/interfaces/invoice';
import { route } from '$app/common/helpers/route';
import { ClickableElement } from './cards';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { NonClickableElement } from './cards/NonClickableElement';
import classNames from 'classnames';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';

export interface Notification {
  label: string;
  date: string;
  link: string;
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

  useSocketEvent({
    on: ['App\\Events\\Invoice\\InvoiceWasPaid'],
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
    },
  });

  const dateFormat = useCurrentCompanyDateFormats();

  return (
    <>
      <div className="relative mt-2 mr-1">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={classNames({
            'animate-jiggle': notifications.length > 0,
          })}
        >
          <Bell size={20} />

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
        {notifications.map((notification, i) => (
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
        ))}

        {notifications.length === 0 ? (
          <NonClickableElement>
            {t('no_unread_notifications')}
          </NonClickableElement>
        ) : null}
      </Slider>
    </>
  );
}
