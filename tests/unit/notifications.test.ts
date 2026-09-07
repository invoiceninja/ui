import { describe, expect, it } from 'vitest';
import {
  appendNotification,
  Notification,
} from '../../src/components/Notifications';

function paymentNotification(id: string): Notification {
  return {
    label: `Payment ${id} updated`,
    displayLabel: {
      notificationType: 'paymentWasUpdated',
      paymentId: id,
      paymentNumber: id,
    },
    date: Number(id),
    link: `/payments/${id}`,
    readAt: null,
  };
}

describe('appendNotification', () => {
  it('keeps the newest 100 notifications', () => {
    const notifications = Array.from({ length: 101 }, (_, index) =>
      paymentNotification(index.toString())
    ).reduce(appendNotification, [] as Notification[]);

    expect(notifications).toHaveLength(100);
    expect(notifications[0].displayLabel.paymentId).toBe('1');
    expect(notifications[99].displayLabel.paymentId).toBe('100');
  });

  it('ignores repeated events for the same entity and event type', () => {
    const notification = paymentNotification('1');
    const notifications = appendNotification([notification], {
      ...notification,
      date: 2,
    });

    expect(notifications).toEqual([notification]);
  });

  it('keeps different event types for the same entity', () => {
    const paid: Notification = {
      label: 'Invoice paid',
      displayLabel: {
        notificationType: 'invoiceWasPaid',
        invoiceId: '1',
      },
      date: 1,
      link: '/invoices/1',
      readAt: null,
    };
    const viewed: Notification = {
      ...paid,
      label: 'Invoice viewed',
      displayLabel: {
        notificationType: 'invoiceWasViewed',
        invoiceId: '1',
      },
    };

    expect(appendNotification([paid], viewed)).toEqual([paid, viewed]);
  });

  it('de-duplicates identical generic messages', () => {
    const message: Notification = {
      label: 'Maintenance notice',
      displayLabel: {
        notificationType: 'genericMessage',
        message: 'Maintenance notice',
      },
      date: 1,
      link: '/status',
      readAt: null,
    };

    expect(appendNotification([message], { ...message, date: 2 })).toEqual([
      message,
    ]);
  });
});
