/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';

export function useEvents() {
  const [t] = useTranslation();

  const EVENT_CREATE_CLIENT = '1';
  const EVENT_CREATE_INVOICE = '2';
  const EVENT_CREATE_QUOTE = '3';
  const EVENT_CREATE_PAYMENT = '4';
  const EVENT_CREATE_VENDOR = '5';
  const EVENT_UPDATE_QUOTE = '6';
  const EVENT_DELETE_QUOTE = '7';
  const EVENT_UPDATE_INVOICE = '8';
  const EVENT_DELETE_INVOICE = '9';
  const EVENT_UPDATE_CLIENT = '10';
  const EVENT_DELETE_CLIENT = '11';
  const EVENT_DELETE_PAYMENT = '12';
  const EVENT_UPDATE_VENDOR = '13';
  const EVENT_DELETE_VENDOR = '14';
  const EVENT_CREATE_EXPENSE = '15';
  const EVENT_UPDATE_EXPENSE = '16';
  const EVENT_DELETE_EXPENSE = '17';
  const EVENT_CREATE_TASK = '18';
  const EVENT_UPDATE_TASK = '19';
  const EVENT_DELETE_TASK = '20';
  const EVENT_APPROVE_QUOTE = '21';
  const EVENT_LATE_INVOICE = '22';
  const EVENT_EXPIRED_QUOTE = '23';
  const EVENT_REMIND_INVOICE = '24';
  const EVENT_ARCHIVE_INVOICE = '33';
  const EVENT_ARCHIVE_CLIENT = '37';
  const EVENT_RESTORE_INVOICE = '41';
  const EVENT_RESTORE_CLIENT = '45';
  const EVENT_SENT_INVOICE = '60';
  const EVENT_SENT_QUOTE = '61';
  const EVENT_ARCHIVE_QUOTE = '34';
  const EVENT_RESTORE_QUOTE = '42';
  const EVENT_CREATE_CREDIT = '27';
  const EVENT_SENT_CREDIT = '62';
  const EVENT_UPDATE_CREDIT = '28';
  const EVENT_ARCHIVE_CREDIT = '35';
  const EVENT_RESTORE_CREDIT = '43';
  const EVENT_DELETE_CREDIT = '29';
  const EVENT_UPDATE_PAYMENT = '31';
  const EVENT_ARCHIVE_PAYMENT = '32';
  const EVENT_RESTORE_PAYMENT = '40';
  const EVENT_ARCHIVE_VENDOR = '48';
  const EVENT_RESTORE_VENDOR = '49';
  const EVENT_ARCHIVE_EXPENSE = '39';
  const EVENT_RESTORE_EXPENSE = '47';
  const EVENT_ARCHIVE_TASK = '36';
  const EVENT_RESTORE_TASK = '44';
  const EVENT_CREATE_PROJECT = '25';
  const EVENT_UPDATE_PROJECT = '26';
  const EVENT_ARCHIVE_PROJECT = '38';
  const EVENT_RESTORE_PROJECT = '46';
  const EVENT_DELETE_PROJECT = '30';
  const EVENT_CREATE_PRODUCT = '50';
  const EVENT_UPDATE_PRODUCT = '51';
  const EVENT_DELETE_PRODUCT = '52';
  const EVENT_RESTORE_PRODUCT = '53';
  const EVENT_ARCHIVE_PRODUCT = '54';
  const EVENT_CREATE_PURCHASE_ORDER = '55';
  const EVENT_SENT_PURCHASE_ORDER = '63';
  const EVENT_UPDATE_PURCHASE_ORDER = '56';
  const EVENT_DELETE_PURCHASE_ORDER = '57';
  const EVENT_RESTORE_PURCHASE_ORDER = '58';
  const EVENT_ARCHIVE_PURCHASE_ORDER = '59';

  return [
    { event: EVENT_CREATE_CLIENT, label: t('create_client') },
    { event: EVENT_UPDATE_CLIENT, label: t('update_client') },
    { event: EVENT_ARCHIVE_CLIENT, label: t('archive_client') },
    { event: EVENT_RESTORE_CLIENT, label: t('restore_client') },
    { event: EVENT_DELETE_CLIENT, label: t('delete_client') },

    { event: EVENT_CREATE_INVOICE, label: t('create_invoice') },
    { event: EVENT_SENT_INVOICE, label: t('sent_invoice') },
    { event: EVENT_UPDATE_INVOICE, label: t('update_invoice') },
    { event: EVENT_LATE_INVOICE, label: t('late_invoice') },
    { event: EVENT_REMIND_INVOICE, label: t('remind_invoice') },
    { event: EVENT_ARCHIVE_INVOICE, label: t('archive_invoice') },
    { event: EVENT_RESTORE_INVOICE, label: t('restore_invoice') },
    { event: EVENT_DELETE_INVOICE, label: t('delete_invoice') },

    { event: EVENT_CREATE_QUOTE, label: t('create_quote') },
    { event: EVENT_SENT_QUOTE, label: t('sent_quote') },
    { event: EVENT_UPDATE_QUOTE, label: t('update_quote') },
    { event: EVENT_APPROVE_QUOTE, label: t('approve_quote') },
    { event: EVENT_EXPIRED_QUOTE, label: t('expired_quote') },
    { event: EVENT_ARCHIVE_QUOTE, label: t('archive_quote') },
    { event: EVENT_RESTORE_QUOTE, label: t('restore_quote') },
    { event: EVENT_DELETE_QUOTE, label: t('delete_quote') },

    { event: EVENT_CREATE_CREDIT, label: t('create_credit') },
    { event: EVENT_SENT_CREDIT, label: t('sent_credit') },
    { event: EVENT_UPDATE_CREDIT, label: t('update_credit') },
    { event: EVENT_ARCHIVE_CREDIT, label: t('archive_credit') },
    { event: EVENT_RESTORE_CREDIT, label: t('restore_credit') },
    { event: EVENT_DELETE_CREDIT, label: t('delete_credit') },

    { event: EVENT_CREATE_PAYMENT, label: t('create_payment') },
    { event: EVENT_UPDATE_PAYMENT, label: t('update_payment') },
    { event: EVENT_ARCHIVE_PAYMENT, label: t('archive_payment') },
    { event: EVENT_RESTORE_PAYMENT, label: t('restore_payment') },
    { event: EVENT_DELETE_PAYMENT, label: t('delete_payment') },

    { event: EVENT_CREATE_VENDOR, label: t('create_vendor') },
    { event: EVENT_UPDATE_VENDOR, label: t('update_vendor') },
    { event: EVENT_ARCHIVE_VENDOR, label: t('archive_vendor') },
    { event: EVENT_RESTORE_VENDOR, label: t('restore_vendor') },
    { event: EVENT_DELETE_VENDOR, label: t('delete_vendor') },

    { event: EVENT_CREATE_EXPENSE, label: t('create_expense') },
    { event: EVENT_UPDATE_EXPENSE, label: t('update_expense') },
    { event: EVENT_ARCHIVE_EXPENSE, label: t('archive_expense') },
    { event: EVENT_RESTORE_EXPENSE, label: t('restore_expense') },
    { event: EVENT_DELETE_EXPENSE, label: t('delete_expense') },

    { event: EVENT_CREATE_TASK, label: t('create_task') },
    { event: EVENT_UPDATE_TASK, label: t('update_task') },
    { event: EVENT_ARCHIVE_TASK, label: t('archive_task') },
    { event: EVENT_RESTORE_TASK, label: t('restore_task') },
    { event: EVENT_DELETE_TASK, label: t('delete_task') },

    { event: EVENT_CREATE_PROJECT, label: t('create_project') },
    { event: EVENT_UPDATE_PROJECT, label: t('update_project') },
    { event: EVENT_ARCHIVE_PROJECT, label: t('archive_project') },
    { event: EVENT_RESTORE_PROJECT, label: t('restore_project') },
    { event: EVENT_DELETE_PROJECT, label: t('delete_project') },

    { event: EVENT_CREATE_PRODUCT, label: t('create_product') },
    { event: EVENT_UPDATE_PRODUCT, label: t('update_product') },
    { event: EVENT_DELETE_PRODUCT, label: t('delete_product') },
    { event: EVENT_RESTORE_PRODUCT, label: t('restore_product') },
    { event: EVENT_ARCHIVE_PRODUCT, label: t('archive_product') },

    { event: EVENT_CREATE_PURCHASE_ORDER, label: t('create_purchase_order') },
    { event: EVENT_SENT_PURCHASE_ORDER, label: t('sent_purchase_order') },
    { event: EVENT_UPDATE_PURCHASE_ORDER, label: t('update_purchase_order') },
    { event: EVENT_DELETE_PURCHASE_ORDER, label: t('delete_purchase_order') },
    {
      event: EVENT_RESTORE_PURCHASE_ORDER,
      label: t('restore_purchase_order'),
    },
    {
      event: EVENT_ARCHIVE_PURCHASE_ORDER,
      label: t('archive_purchase_order'),
    },
  ];
}
