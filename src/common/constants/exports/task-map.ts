/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
interface Record {
    trans: string;
    value: string;
}

export const taskMap: Record[] = [
    { trans: 'start_date', value: 'start_date'},
    { trans: 'end_date', value: 'end_date'},
    { trans: 'duration', value: 'duration'},
    { trans: 'rate', value: 'rate'},
    { trans: 'number', value: 'number'},
    { trans: 'description', value: 'description'},
    { trans: 'custom_value1', value: 'custom_value1'},
    { trans: 'custom_value2', value: 'custom_value2'},
    { trans: 'custom_value3', value: 'custom_value3'},
    { trans: 'custom_value4', value: 'custom_value4'},
    { trans: 'status', value: 'status_id'},
    { trans: 'project', value: 'project_id'},
    { trans: 'invoice', value: 'invoice_id'},
    { trans: 'client', value: 'client_id'},
];