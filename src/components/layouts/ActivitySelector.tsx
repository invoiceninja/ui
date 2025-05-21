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
import { SearchableSelect } from '../SearchableSelect';

export interface GenericSelectorProps<T = string> {
    value: T;
    label?: string | null;
    onChange: (activity_type_id: string) => unknown;
    errorMessage?: string | string[];
    dismissable?: boolean;
    disabled?: boolean;
}

export const ACTIVITY_TYPES = {
    CREATE_CLIENT: 1,
    ARCHIVE_CLIENT: 2,
    DELETE_CLIENT: 3,
    CREATE_INVOICE: 4,
    UPDATE_INVOICE: 5,
    EMAIL_INVOICE: 6,
    VIEW_INVOICE: 7,
    ARCHIVE_INVOICE: 8,
    DELETE_INVOICE: 9,
    CREATE_PAYMENT: 10,
    UPDATE_PAYMENT: 11,
    ARCHIVE_PAYMENT: 12,
    DELETE_PAYMENT: 13,
    CREATE_CREDIT: 14,
    UPDATE_CREDIT: 15,
    ARCHIVE_CREDIT: 16,
    DELETE_CREDIT: 17,
    CREATE_QUOTE: 18,
    UPDATE_QUOTE: 19,
    EMAIL_QUOTE: 20,
    VIEW_QUOTE: 21,
    ARCHIVE_QUOTE: 22,
    DELETE_QUOTE: 23,
    RESTORE_QUOTE: 24,
    RESTORE_INVOICE: 25,
    RESTORE_CLIENT: 26,
    RESTORE_PAYMENT: 27,
    RESTORE_CREDIT: 28,
    APPROVE_QUOTE: 29,
    CREATE_VENDOR: 30,
    ARCHIVE_VENDOR: 31,
    DELETE_VENDOR: 32,
    RESTORE_VENDOR: 33,
    CREATE_EXPENSE: 34,
    ARCHIVE_EXPENSE: 35,
    DELETE_EXPENSE: 36,
    RESTORE_EXPENSE: 37,
    VOIDED_PAYMENT: 39,
    REFUNDED_PAYMENT: 40,
    FAILED_PAYMENT: 41,
    CREATE_TASK: 42,
    UPDATE_TASK: 43,
    ARCHIVE_TASK: 44,
    DELETE_TASK: 45,
    RESTORE_TASK: 46,
    UPDATE_EXPENSE: 47,
    CREATE_USER: 48,
    UPDATE_USER: 49,
    ARCHIVE_USER: 50,
    DELETE_USER: 51,
    RESTORE_USER: 52,
    MARK_SENT_INVOICE: 53,
    PAID_INVOICE: 54,
    EMAIL_INVOICE_FAILED: 57,
    REVERSED_INVOICE: 58,
    CANCELLED_INVOICE: 59,
    VIEW_CREDIT: 60,
    UPDATE_CLIENT: 61,
    UPDATE_VENDOR: 62,
    INVOICE_REMINDER1_SENT: 63,
    INVOICE_REMINDER2_SENT: 64,
    INVOICE_REMINDER3_SENT: 65,
    INVOICE_REMINDER_ENDLESS_SENT: 66,
    CREATE_SUBSCRIPTION: 80,
    UPDATE_SUBSCRIPTION: 81,
    ARCHIVE_SUBSCRIPTION: 82,
    DELETE_SUBSCRIPTION: 83,
    RESTORE_SUBSCRIPTION: 84,
    CREATE_RECURRING_INVOICE: 100,
    UPDATE_RECURRING_INVOICE: 101,
    ARCHIVE_RECURRING_INVOICE: 102,
    DELETE_RECURRING_INVOICE: 103,
    RESTORE_RECURRING_INVOICE: 104,
    CREATE_RECURRING_QUOTE: 110,
    UPDATE_RECURRING_QUOTE: 111,
    ARCHIVE_RECURRING_QUOTE: 112,
    DELETE_RECURRING_QUOTE: 113,
    RESTORE_RECURRING_QUOTE: 114,
    CREATE_RECURRING_EXPENSE: 120,
    UPDATE_RECURRING_EXPENSE: 121,
    ARCHIVE_RECURRING_EXPENSE: 122,
    DELETE_RECURRING_EXPENSE: 123,
    RESTORE_RECURRING_EXPENSE: 124,
    CREATE_PURCHASE_ORDER: 130,
    UPDATE_PURCHASE_ORDER: 131,
    ARCHIVE_PURCHASE_ORDER: 132,
    DELETE_PURCHASE_ORDER: 133,
    RESTORE_PURCHASE_ORDER: 134,
    EMAIL_PURCHASE_ORDER: 135,
    VIEW_PURCHASE_ORDER: 136,
    ACCEPT_PURCHASE_ORDER: 137,
    PAYMENT_EMAILED: 138,
    VENDOR_NOTIFICATION_EMAIL: 139,
    EMAIL_STATEMENT: 140,
    USER_NOTE: 141,
    QUOTE_REMINDER1_SENT: 142,
    AUTOBILL_SUCCESS: 143,
    AUTOBILL_FAILURE: 144,
    EINVOICE_SENT: 145,
    EINVOICE_DELIVERY_SUCCESS: 146,
    EINVOICE_DELIVERY_FAILURE: 147,
    E_EXPENSE_CREATED: 148,
    EMAIL_CREDIT: 149,
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

export function useActivityLabels(): Record<ActivityType, string> {
    const [t] = useTranslation();

    return {
        [ACTIVITY_TYPES.CREATE_CLIENT]: t('create_client'),
        [ACTIVITY_TYPES.ARCHIVE_CLIENT]: t('archive_client'),
        [ACTIVITY_TYPES.DELETE_CLIENT]: t('delete_client'),
        [ACTIVITY_TYPES.CREATE_INVOICE]: t('create_invoice'),
        [ACTIVITY_TYPES.UPDATE_INVOICE]: t('update_invoice'),
        [ACTIVITY_TYPES.EMAIL_INVOICE]: t('sent_invoice'),
        [ACTIVITY_TYPES.VIEW_INVOICE]: t('view_invoice'),
        [ACTIVITY_TYPES.ARCHIVE_INVOICE]: t('archive_invoice'),
        [ACTIVITY_TYPES.DELETE_INVOICE]: t('delete_invoice'),
        [ACTIVITY_TYPES.CREATE_PAYMENT]: t('create_payment'),
        [ACTIVITY_TYPES.UPDATE_PAYMENT]: t('update_payment'),
        [ACTIVITY_TYPES.ARCHIVE_PAYMENT]: t('archive_payment'),
        [ACTIVITY_TYPES.DELETE_PAYMENT]: t('delete_payment'),
        [ACTIVITY_TYPES.CREATE_CREDIT]: t('create_credit'),
        [ACTIVITY_TYPES.UPDATE_CREDIT]: t('update_credit'),
        [ACTIVITY_TYPES.ARCHIVE_CREDIT]: t('archive_credit'),
        [ACTIVITY_TYPES.DELETE_CREDIT]: t('delete_credit'),
        [ACTIVITY_TYPES.CREATE_QUOTE]: t('create_quote'),
        [ACTIVITY_TYPES.UPDATE_QUOTE]: t('update_quote'),
        [ACTIVITY_TYPES.EMAIL_QUOTE]: t('sent_quote'),
        [ACTIVITY_TYPES.VIEW_QUOTE]: t('view_quote'),
        [ACTIVITY_TYPES.ARCHIVE_QUOTE]: t('archive_quote'),
        [ACTIVITY_TYPES.DELETE_QUOTE]: t('delete_quote'),
        [ACTIVITY_TYPES.RESTORE_QUOTE]: t('restore_quote'),
        [ACTIVITY_TYPES.RESTORE_INVOICE]: t('restore_invoice'),
        [ACTIVITY_TYPES.RESTORE_CLIENT]: t('restore_client'),
        [ACTIVITY_TYPES.RESTORE_PAYMENT]: t('restore_payment'),
        [ACTIVITY_TYPES.RESTORE_CREDIT]: t('restore_credit'),
        [ACTIVITY_TYPES.APPROVE_QUOTE]: t('approve_quote'),
        [ACTIVITY_TYPES.CREATE_VENDOR]: t('create_vendor'),
        [ACTIVITY_TYPES.ARCHIVE_VENDOR]: t('archive_vendor'),
        [ACTIVITY_TYPES.DELETE_VENDOR]: t('delete_vendor'),
        [ACTIVITY_TYPES.RESTORE_VENDOR]: t('restore_vendor'),
        [ACTIVITY_TYPES.CREATE_EXPENSE]: t('create_expense'),
        [ACTIVITY_TYPES.ARCHIVE_EXPENSE]: t('archive_expense'),
        [ACTIVITY_TYPES.DELETE_EXPENSE]: t('delete_expense'),
        [ACTIVITY_TYPES.RESTORE_EXPENSE]: t('restore_expense'),
        [ACTIVITY_TYPES.VOIDED_PAYMENT]: t('voided_payment'),
        [ACTIVITY_TYPES.REFUNDED_PAYMENT]: t('refunded_payment'),
        [ACTIVITY_TYPES.FAILED_PAYMENT]: t('failed_payment'),
        [ACTIVITY_TYPES.CREATE_TASK]: t('create_task'),
        [ACTIVITY_TYPES.UPDATE_TASK]: t('update_task'),
        [ACTIVITY_TYPES.ARCHIVE_TASK]: t('archive_task'),
        [ACTIVITY_TYPES.DELETE_TASK]: t('delete_task'),
        [ACTIVITY_TYPES.RESTORE_TASK]: t('restore_task'),
        [ACTIVITY_TYPES.UPDATE_EXPENSE]: t('update_expense'),
        [ACTIVITY_TYPES.CREATE_USER]: t('create_user'),
        [ACTIVITY_TYPES.UPDATE_USER]: t('update_user'),
        [ACTIVITY_TYPES.ARCHIVE_USER]: t('archive_user'),
        [ACTIVITY_TYPES.DELETE_USER]: t('delete_user'),
        [ACTIVITY_TYPES.RESTORE_USER]: t('restore_user'),
        [ACTIVITY_TYPES.MARK_SENT_INVOICE]: t('sent_invoice'),
        [ACTIVITY_TYPES.PAID_INVOICE]: t('paid_invoice'),
        [ACTIVITY_TYPES.EMAIL_INVOICE_FAILED]: t('email_invoice_failed'),
        [ACTIVITY_TYPES.REVERSED_INVOICE]: t('reversed_invoice'),
        [ACTIVITY_TYPES.CANCELLED_INVOICE]: t('cancelled_invoice'),
        [ACTIVITY_TYPES.VIEW_CREDIT]: t('view_credit'),
        [ACTIVITY_TYPES.UPDATE_CLIENT]: t('update_client'),
        [ACTIVITY_TYPES.UPDATE_VENDOR]: t('update_vendor'),
        [ACTIVITY_TYPES.INVOICE_REMINDER1_SENT]: t('remind_invoice'),
        [ACTIVITY_TYPES.INVOICE_REMINDER2_SENT]: t('remind_invoice'),
        [ACTIVITY_TYPES.INVOICE_REMINDER3_SENT]: t('remind_invoice'),
        [ACTIVITY_TYPES.INVOICE_REMINDER_ENDLESS_SENT]: t('remind_invoice'),
        [ACTIVITY_TYPES.CREATE_SUBSCRIPTION]: t('create_subscription'),
        [ACTIVITY_TYPES.UPDATE_SUBSCRIPTION]: t('update_subscription'),
        [ACTIVITY_TYPES.ARCHIVE_SUBSCRIPTION]: t('archive_subscription'),
        [ACTIVITY_TYPES.DELETE_SUBSCRIPTION]: t('delete_subscription'),
        [ACTIVITY_TYPES.RESTORE_SUBSCRIPTION]: t('restore_subscription'),
        [ACTIVITY_TYPES.CREATE_RECURRING_INVOICE]: t('create_recurring_invoice'),
        [ACTIVITY_TYPES.UPDATE_RECURRING_INVOICE]: t('update_recurring_invoice'),
        [ACTIVITY_TYPES.ARCHIVE_RECURRING_INVOICE]: t('archive_recurring_invoice'),
        [ACTIVITY_TYPES.DELETE_RECURRING_INVOICE]: t('delete_recurring_invoice'),
        [ACTIVITY_TYPES.RESTORE_RECURRING_INVOICE]: t('restore_recurring_invoice'),
        [ACTIVITY_TYPES.CREATE_RECURRING_QUOTE]: t('create_recurring_quote'),
        [ACTIVITY_TYPES.UPDATE_RECURRING_QUOTE]: t('update_recurring_quote'),
        [ACTIVITY_TYPES.ARCHIVE_RECURRING_QUOTE]: t('archive_recurring_quote'),
        [ACTIVITY_TYPES.DELETE_RECURRING_QUOTE]: t('delete_recurring_quote'),
        [ACTIVITY_TYPES.RESTORE_RECURRING_QUOTE]: t('restore_recurring_quote'),
        [ACTIVITY_TYPES.CREATE_RECURRING_EXPENSE]: t('create_recurring_expense'),
        [ACTIVITY_TYPES.UPDATE_RECURRING_EXPENSE]: t('update_recurring_expense'),
        [ACTIVITY_TYPES.ARCHIVE_RECURRING_EXPENSE]: t('archive_recurring_expense'),
        [ACTIVITY_TYPES.DELETE_RECURRING_EXPENSE]: t('delete_recurring_expense'),
        [ACTIVITY_TYPES.RESTORE_RECURRING_EXPENSE]: t('restore_recurring_expense'),
        [ACTIVITY_TYPES.CREATE_PURCHASE_ORDER]: t('create_purchase_order'),
        [ACTIVITY_TYPES.UPDATE_PURCHASE_ORDER]: t('update_purchase_order'),
        [ACTIVITY_TYPES.ARCHIVE_PURCHASE_ORDER]: t('archive_purchase_order'),
        [ACTIVITY_TYPES.DELETE_PURCHASE_ORDER]: t('delete_purchase_order'),
        [ACTIVITY_TYPES.RESTORE_PURCHASE_ORDER]: t('restore_purchase_order'),
        [ACTIVITY_TYPES.EMAIL_PURCHASE_ORDER]: t('sent_purchase_order'),
        [ACTIVITY_TYPES.VIEW_PURCHASE_ORDER]: t('view_purchase_order'),
        [ACTIVITY_TYPES.ACCEPT_PURCHASE_ORDER]: t('accept_purchase_order'),
        [ACTIVITY_TYPES.PAYMENT_EMAILED]: t('payment_emailed'),
        [ACTIVITY_TYPES.VENDOR_NOTIFICATION_EMAIL]: t('vendor_notification_email'),
        [ACTIVITY_TYPES.EMAIL_STATEMENT]: t('email_statement'),
        [ACTIVITY_TYPES.USER_NOTE]: t('user_note'),
        [ACTIVITY_TYPES.QUOTE_REMINDER1_SENT]: t('remind_quote'),
        [ACTIVITY_TYPES.AUTOBILL_SUCCESS]: t('autobill_success'),
        [ACTIVITY_TYPES.AUTOBILL_FAILURE]: t('autobill_failure'),
        [ACTIVITY_TYPES.EINVOICE_SENT]: t('einvoice_sent'),
        [ACTIVITY_TYPES.EINVOICE_DELIVERY_SUCCESS]: t('einvoice_delivery_success'),
        [ACTIVITY_TYPES.EINVOICE_DELIVERY_FAILURE]: t('einvoice_delivery_failure'),
        [ACTIVITY_TYPES.E_EXPENSE_CREATED]: t('e_expense_created'),
        [ACTIVITY_TYPES.EMAIL_CREDIT]: t('sent_credit'),
    };
}

export function ActivitySelector(props: GenericSelectorProps) {
    const activity_types = useActivityLabels();
    
    return (
        <SearchableSelect
            onValueChange={props.onChange}
            value={props.value}
            label={props.label}
            errorMessage={props.errorMessage}
            dismissable={props.dismissable}
            disabled={props.disabled}
        >
            {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                    {activity_types[value]}
                </option>
            ))}
        </SearchableSelect>
    );
}
