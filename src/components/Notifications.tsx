/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Bell, Download } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { GoDotFill } from 'react-icons/go';
import { useColorScheme } from '$app/common/colors';
import { useInvoiceEditorPaths } from '$app/common/hooks/useInvoiceEditor';
import { date, isHosted, isSelfHosted, trans } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useReplaceVariables } from '$app/common/hooks/useReplaceTranslationVariables';
import { useSockets } from '$app/common/hooks/useSockets';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { Payment } from '$app/common/interfaces/payment';
import {
  buildGeneralChannelName,
  DownloadAvailable,
  GenericMessage,
  socketId,
  useSocketEvent,
  WithSocketId,
} from '$app/common/queries/sockets';
import { bindChannelLogging, logSocketDebug } from '$app/common/queries/socketLogging';
import { subscribeWhenConnected } from '$app/common/queries/socketSubscription';
import { NonClickableElement } from './cards/NonClickableElement';
import { Slider } from './cards/Slider';
import { Button, Link } from './forms';
import { CardChange } from './icons/CardChange';
import { CardCheck } from './icons/CardCheck';
import { FileAdd } from './icons/FileAdd';
import { FileEdit } from './icons/FileEdit';
import { FileSearch } from './icons/FileSearch';
import { Icon } from './icons/Icon';

type NotificationType =
  | 'invoiceWasPaid'
  | 'invoiceWasViewed'
  | 'creditWasCreated'
  | 'creditWasUpdated'
  | 'paymentWasUpdated'
  | 'genericMessage'
  | 'downloadAvailable';

interface DisplayLabel {
  notificationType: NotificationType;
  invoiceNumber?: string;
  clientName?: string;
  invoiceId?: string;
  clientId?: string;
  message?: string;
  creditId?: string;
  creditNumber?: string;
  paymentId?: string;
  paymentNumber?: string;
  url?: string;
}

export interface Notification {
  label: string;
  displayLabel: DisplayLabel;
  date: number;
  link: string | null;
  readAt: string | null;
}

const MAX_NOTIFICATIONS = 100;

export const notificationsAtom = atom<Notification[]>([]);

function getNotificationIdentity(notification: Notification) {
  const { displayLabel } = notification;

  switch (displayLabel.notificationType) {
    case 'invoiceWasPaid':
    case 'invoiceWasViewed':
      return `${displayLabel.notificationType}:${displayLabel.invoiceId}`;
    case 'creditWasCreated':
    case 'creditWasUpdated':
      return `${displayLabel.notificationType}:${displayLabel.creditId}`;
    case 'paymentWasUpdated':
      return `${displayLabel.notificationType}:${displayLabel.paymentId}`;
    case 'genericMessage':
      return `${displayLabel.notificationType}:${notification.link ?? ''}:${displayLabel.message ?? ''}`;
    case 'downloadAvailable':
      return `${displayLabel.notificationType}:${displayLabel.url ?? ''}`;
  }
}

export function appendNotification(
  notifications: Notification[],
  notification: Notification
) {
  const identity = getNotificationIdentity(notification);

  if (
    notifications.some(
      (currentNotification) =>
        getNotificationIdentity(currentNotification) === identity
    )
  ) {
    return notifications;
  }

  return [...notifications, notification].slice(-MAX_NOTIFICATIONS);
}

export function Notifications() {
  const invoicePaths = useInvoiceEditorPaths();
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const replaceVariables = useReplaceVariables();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  const sockets = useSockets();
  const colors = useColorScheme();
  const reactSettings = useReactSettings();
  const companyUser = useCurrentCompanyUser();
  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  useEffect(() => {
    try {
      localStorage.removeItem('notifications');
    } catch {
      // Notifications are transient, so legacy storage cleanup is best-effort.
    }
  }, []);

  const generateDisplayLabel = (currentDisplayLabel: DisplayLabel) => {
    if (currentDisplayLabel.notificationType === 'invoiceWasPaid') {
      return replaceVariables(
        t('notification_invoice_paid_subject') as string,
        {
          invoice: (
            <Link
              to={route(invoicePaths.edit, {
                id: currentDisplayLabel.invoiceId,
              })}
            >
              {`#${currentDisplayLabel.invoiceNumber}`}
            </Link>
          ),

          client: (
            <Link
              to={route('/clients/:id', { id: currentDisplayLabel.clientId })}
            >
              {currentDisplayLabel.clientName}
            </Link>
          ),
        }
      );
    }

    if (currentDisplayLabel.notificationType === 'invoiceWasViewed') {
      return replaceVariables(
        t('notification_invoice_viewed_subject') as string,
        {
          invoice: (
            <Link
              to={route(invoicePaths.edit, {
                id: currentDisplayLabel.invoiceId,
              })}
            >
              {`#${currentDisplayLabel.invoiceNumber}`}
            </Link>
          ),

          client: (
            <Link
              to={route('/clients/:id', { id: currentDisplayLabel.clientId })}
            >
              {currentDisplayLabel.clientName}
            </Link>
          ),
        }
      );
    }

    if (currentDisplayLabel.notificationType === 'creditWasCreated') {
      return replaceVariables(
        t('notification_credit_created_subject') as string,
        {
          invoice: (
            <Link
              to={route('/credits/:id/edit', {
                id: currentDisplayLabel.creditId,
              })}
            >
              {`#${currentDisplayLabel.creditNumber}`}
            </Link>
          ),

          client: (
            <Link
              to={route('/clients/:id', { id: currentDisplayLabel.clientId })}
            >
              {currentDisplayLabel.clientName}
            </Link>
          ),
        }
      );
    }

    if (currentDisplayLabel.notificationType === 'creditWasUpdated') {
      return (
        <div className="flex items-center space-x-1">
          <span>{t('credit_updated')}:</span>

          <Link
            to={route('/credits/:id/edit', {
              id: currentDisplayLabel.creditId,
            })}
          >
            {`#${currentDisplayLabel.creditNumber}`}
          </Link>
        </div>
      );
    }

    if (currentDisplayLabel.notificationType === 'paymentWasUpdated') {
      return (
        <div className="flex items-center space-x-1">
          <span>{t('payment_updated')}:</span>

          <Link
            to={route('/payments/:id/edit', {
              id: currentDisplayLabel.paymentId,
            })}
          >
            {`#${currentDisplayLabel.paymentNumber}`}
          </Link>
        </div>
      );
    }

    if (currentDisplayLabel.notificationType === 'downloadAvailable') {
      return (
        <div className="flex flex-wrap items-center gap-x-1">
          <span>{currentDisplayLabel.message}</span>

          <Link
            to={currentDisplayLabel.url as string}
            external
            withoutExternalIcon
          >
            {t('download')}
          </Link>
        </div>
      );
    }

    return currentDisplayLabel.message;
  };

  const generateIcon = (notificationType: NotificationType) => {
    if (notificationType === 'invoiceWasPaid') {
      return (
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.$15 }}
        >
          <CardCheck size="1.3rem" color={colors.$16} />
        </div>
      );
    }

    if (notificationType === 'invoiceWasViewed') {
      return (
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.$15 }}
        >
          <FileSearch size="1.3rem" color={colors.$16} />
        </div>
      );
    }

    if (notificationType === 'creditWasCreated') {
      return (
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.$15 }}
        >
          <FileAdd size="1.3rem" color={colors.$16} />
        </div>
      );
    }

    if (notificationType === 'creditWasUpdated') {
      return (
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.$15 }}
        >
          <FileEdit size="1.3rem" color={colors.$16} />
        </div>
      );
    }

    if (notificationType === 'paymentWasUpdated') {
      return (
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.$15 }}
        >
          <CardChange size="1.3rem" color={colors.$16} />
        </div>
      );
    }

    if (notificationType === 'downloadAvailable') {
      return (
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.$15 }}
        >
          <Icon className="w-5 h-5" element={Download} color={colors.$16} />
        </div>
      );
    }

    return null;
  };

  const getDateTimeLabel = (dateTimestamp: number) => {
    const now = dayjs();
    const timestamp = dayjs.unix(dateTimestamp);

    const diffDays = now.diff(timestamp, 'day');
    const diffMinutes = now.diff(timestamp, 'minute');

    if (diffMinutes <= 1) {
      return t('just_now');
    } else if (diffDays === 1) {
      return t('yesterday');
    } else {
      return date(dateTimestamp, `${dateFormat} ${timeFormat}`);
    }
  };

  useSocketEvent({
    on: [
      'App\\Events\\Invoice\\InvoiceWasPaid',
      'App\\Events\\Invoice\\InvoiceWasViewed',
      'App\\Events\\Credit\\CreditWasCreated',
      'App\\Events\\Credit\\CreditWasUpdated',
      'App\\Events\\Payment\\PaymentWasUpdated',
      'App\\Events\\Socket\\DownloadAvailable',
    ],
    callback: ({ event, data }) => {
      logSocketDebug(`notification received: ${event}`, data);

      if (event === 'App\\Events\\Invoice\\InvoiceWasPaid') {
        const $invoice = data as Invoice;

        const notification = {
          label: `${$invoice.number}: ${t('invoice_paid')}`,
          displayLabel: {
            notificationType: 'invoiceWasPaid' as const,
            invoiceNumber: $invoice.number,
            clientName: $invoice.client?.display_name,
            invoiceId: $invoice.id,
            clientId: $invoice.client_id,
          },
          date: dayjs().unix(),
          link: route(invoicePaths.edit, { id: $invoice.id }),
          readAt: null,
        };

        if (
          socketId()?.toString() !==
          (data as WithSocketId<Invoice>)['x-socket-id']
        ) {
          queryClient.invalidateQueries({
            queryKey: ['/api/v1/invoices', 'detail', $invoice.id],
          });

          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey as string[];

              return (
                key.includes('/api/v1/invoices') && !key.includes('detail')
              );
            },
          });
        }

        setNotifications((notifications) =>
          appendNotification(notifications, notification)
        );
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
          displayLabel: {
            notificationType: 'invoiceWasViewed' as const,
            invoiceNumber: $invoice.number,
            clientName: $invoice.client?.display_name,
            invoiceId: $invoice.id,
            clientId: $invoice.client_id,
          },
          date: dayjs().unix(),
          link: route(invoicePaths.edit, { id: $invoice.id }),
          readAt: null,
        };

        if (
          socketId()?.toString() !==
          (data as WithSocketId<Invoice>)['x-socket-id']
        ) {
          $refetch(['invoices']);
        }

        setNotifications((notifications) =>
          appendNotification(notifications, notification)
        );
      }

      if (event === 'App\\Events\\Credit\\CreditWasCreated') {
        const $credit = data as Credit;

        const notification = {
          label: trans('notification_credit_created_subject', {
            invoice: $credit.number,
            client: $credit.client?.display_name,
          }),
          displayLabel: {
            notificationType: 'creditWasCreated' as const,
            creditNumber: $credit.number,
            clientName: $credit.client?.display_name,
            creditId: $credit.id,
            clientId: $credit.client_id,
          },
          date: dayjs().unix(),
          link: route('/credits/:id/edit', { id: $credit.id }),
          readAt: null,
        };

        setNotifications((notifications) =>
          appendNotification(notifications, notification)
        );
      }

      if (event === 'App\\Events\\Credit\\CreditWasUpdated') {
        const $credit = data as Credit;

        const notification = {
          label: `${t('credit_updated')}: ${$credit.number}`,
          displayLabel: {
            notificationType: 'creditWasUpdated' as const,
            creditNumber: $credit.number,
            creditId: $credit.id,
          },
          date: dayjs().unix(),
          link: route('/credits/:id/edit', { id: $credit.id }),
          readAt: null,
        };

        setNotifications((notifications) =>
          appendNotification(notifications, notification)
        );
      }

      if (event === 'App\\Events\\Payment\\PaymentWasUpdated') {
        const payment = data as Payment;

        const notification = {
          label: `${t('payment_updated')}: ${payment.number}`,
          displayLabel: {
            notificationType: 'paymentWasUpdated' as const,
            paymentNumber: payment.number,
            paymentId: payment.id,
          },
          date: dayjs().unix(),
          link: route('/payments/:id/edit', { id: payment.id }),
          readAt: null,
        };

        setNotifications((notifications) =>
          appendNotification(notifications, notification)
        );
      }

      if (event === 'App\\Events\\Socket\\DownloadAvailable') {
        const download = data as DownloadAvailable;

        const notification = {
          label: download.message,
          displayLabel: {
            notificationType: 'downloadAvailable' as const,
            message: download.message,
            url: download.url,
          },
          date: dayjs().unix(),
          link: download.url,
          readAt: null,
        };

        setNotifications((notifications) =>
          appendNotification(notifications, notification)
        );
      }
    },
  });

  useEffect(() => {
    if (
      isSelfHosted() &&
      !reactSettings.preferences.enable_public_notifications
    ) {
      return;
    }

    if (!sockets) {
      return;
    }

    return subscribeWhenConnected(sockets, () => {
      const channelName = buildGeneralChannelName(isHosted());

      logSocketDebug(`subscribing to ${channelName}`, {
        connectionState: sockets.connection.state,
        socketId: sockets.connection.socket_id,
      });

      const channel = sockets.subscribe(channelName);
      const unbindChannelLogging = bindChannelLogging(channel);

      const onGenericMessage = (message: GenericMessage) => {
        logSocketDebug(
          'notification received: App\\Events\\General\\GenericMessage',
          message
        );

        const notification = {
          label: message.message,
          displayLabel: {
            notificationType: 'genericMessage' as const,
            message: message.message,
          },
          date: dayjs().unix(),
          link: message.link,
          readAt: null,
        };

        setNotifications((notifications) =>
          appendNotification(notifications, notification)
        );
      };

      channel.bind('App\\Events\\General\\GenericMessage', onGenericMessage);

      return () => {
        unbindChannelLogging();
        channel.unbind('App\\Events\\General\\GenericMessage', onGenericMessage);
        sockets.unsubscribe(channel.name);
      };
    });
  }, [sockets, reactSettings.preferences.enable_public_notifications, setNotifications]);

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
        {notifications.length > 0 ? (
          <div className="flex flex-col space-y-2 pt-2">
            {notifications.map(
              (notification, i) =>
                Boolean(notification.displayLabel) && (
                  <div
                    key={i}
                    className="flex items-center justify-between px-6 py-2 space-x-2"
                  >
                    <div className="flex items-center space-x-2.5">
                      {generateIcon(notification.displayLabel.notificationType)}

                      <div className="flex flex-col space-y-0.5">
                        <div
                          className="text-sm"
                          style={{
                            color: colors.$3,
                          }}
                        >
                          {generateDisplayLabel(notification.displayLabel)}
                        </div>

                        <p className="text-xs text-gray-500">
                          {getDateTimeLabel(notification.date)}
                        </p>
                      </div>
                    </div>

                    {!notification.readAt && (
                      <div>
                        <Icon element={GoDotFill} size={14} color="#2176FF" />
                      </div>
                    )}
                  </div>
                )
            )}
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
