/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { Parameters, Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useClientsQuery } from '$app/common/queries/clients';
import { SelectField } from '$app/components/forms';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import { ProductItemsSelector } from '$app/pages/reports/common/components/ProductItemsSelector';
import { Report, useReports } from '$app/pages/reports/common/useReports';

interface Props {
    report?: Report;
    schedule: Schedule;
    handleChange: (
        property: keyof Schedule,
        value: Schedule[keyof Schedule]
    ) => void;
    errors: ValidationBag | undefined;
    page?: 'create' | 'edit';
}

export const scheduleParametersAtom = atom<Parameters | undefined>(undefined);

export enum Reports {
    ACTIVITIES = 'activities',
    CLIENTS = 'clients',
    CLIENT_CONTACTS = 'client_contacts',
    INVOICES = 'invoices',
    INVOICE_ITEMS = 'invoice_items',
    QUOTES = 'quotes',
    QUOTE_ITEMS = 'quote_items',
    RECURRING_INVOICES = 'recurring_invoices',
    CREDITS = 'credits',
    EXPENSES = 'expenses',
    PAYMENTS = 'payments',
    PRODUCTS = 'products',
    TASKS = 'tasks',
    DOCUMENTS = 'documents',
    AR_DETAILED = 'ar_detailed',
    AR_SUMMARY = 'ar_summary',
    CLIENT_BALANCE = 'client_balance',
    TAX_SUMMARY = 'tax_summary',
    PROFITLOSS = 'profitloss',
    CLIENT_SALES = 'client_sales',
    USER_SALES = 'user_sales',
    PRODUCT_SALES = 'product_sales',
}

export function EmailReport(props: Props) {
    const [t] = useTranslation();

    const reports = useReports();

    const parametersAtom = useAtomValue(scheduleParametersAtom);

    const [parameters, setParameters] = useAtom(scheduleParametersAtom);

    const { schedule, handleChange, errors, page } = props;

    const [report, setReport] = useState<Report>(props.report ?? reports[1]);

    const { data: clientsResponse } = useClientsQuery({
        enabled: page === 'edit' || Boolean(parametersAtom),
    });

    const [selectedClients, setSelectedClients] = useState<Client[]>([]);

    const handleChangeParameters = (clients: Client[]) => {
        const currentParameters = { ...schedule.parameters };
        currentParameters.clients = clients.map(({ id }) => id);

        handleChange('parameters', currentParameters);
    };

    // const handleRemoveClient = (clientIndex: number) => {
    //     const updatedClientsList = selectedClients.filter(
    //         (client, index) => index !== clientIndex
    //     );

    //     handleChangeParameters(updatedClientsList);

    //     setSelectedClients(updatedClientsList);
    // };

    const handleStatusChange = (
        statuses: MultiValue<{ value: string; label: string }>
    ) => {
        const values: Array<string> = [];

        (statuses as SelectOption[]).map(
            (option: { value: string; label: string }) => values.push(option.value)
        );

        const currentParameters = {...schedule.parameters};
        currentParameters.status = values.join(',');

        handleChange('parameters', currentParameters);
    };

    const filters = useInvoiceFilters();

    const customStyles: StylesConfig<SelectOption, true> = {
        multiValue: (styles, { data }) => {
            return {
                ...styles,
                backgroundColor: data.backgroundColor,
                color: data.color,
                borderRadius: '3px',
            };
        },
        multiValueLabel: (styles, { data }) => ({
            ...styles,
            color: data.color,
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            ':hover': {
                color: 'white',
            },
            color: '#999999',
        }),
    };

    useEffect(() => {
        if ((page === 'edit' || parametersAtom) && clientsResponse) {
            const clients = clientsResponse?.filter((client: Client) =>
                schedule.parameters.clients?.includes(client.id)
            );

            setSelectedClients(clients);
        }

        if(props.report && !schedule.parameters.send_email){
            
            const currentParameters = { ...schedule.parameters };

            currentParameters.date_range = report.payload.date_range;
            currentParameters.end_date = report.payload.end_date;
            currentParameters.start_date = report.payload.start_date;
            currentParameters.report_keys = report.payload.report_keys;
            currentParameters.status = report.payload.status;
            currentParameters.report_name = report.identifier;  
            currentParameters.send_email = true;
            currentParameters.date_key = report.payload.date_key;  

            // handleChange('parameters', currentParameters);  
            setParameters(currentParameters);

        }

        if(report){
            const currentParameters = { ...schedule.parameters };
            currentParameters.product_key = report.payload.product_key;  
            // handleChange('parameters', currentParameters);  
            setParameters(currentParameters);

            console.log('updating parameters');

        }

    }, [clientsResponse, report]);

    return (
    <>
    
        <Element leftSide={t('report')}>
            <SelectField
                value={schedule.parameters.report_name}
                onValueChange={(value) =>
                    handleChange('parameters.report_name' as keyof Schedule, value)
                }
                errorMessage={errors?.errors['parameters.report_name']}
            >
                <option value="clients">{t('clients')}</option>
                <option value="client_contacts">{t('client_contacts')}</option>
                <option value="invoices">{t('invoices')}</option>
                <option value="invoice_items">{t('invoice_items')}</option>
                <option value="quotes">{t('quotes')}</option>
                <option value="quote_items">{t('quote_items')}</option>
                <option value="recurring_invoices">{t('recurring_invoices')}</option>
                <option value="credits">{t('credits')}</option>
                <option value="expenses">{t('expenses')}</option>
                <option value="payments">{t('payments')}</option>
                <option value="products">{t('products')}</option>
                <option value="tasks">{t('tasks')}</option>
                <option value="documents">{t('documents')}</option>
                <option value="ar_detailed">{t('ar_detailed')}</option>
                <option value="ar_summary">{t('ar_summary')}</option>
                <option value="client_balance">{t('client_balance')}</option>
                <option value="tax_summary">{t('tax_summary')}</option>
                <option value="profitloss">{t('profitloss')}</option>
                <option value="client_sales">{t('client_sales')}</option>
                <option value="user_sales">{t('user_sales')}</option>
                <option value="product_sales">{t('product_sales')}</option>
            </SelectField>
        </Element>

    {schedule.parameters.report_name === Reports.INVOICES && (
        <Element leftSide={t('status')} className={'mb-50 py-50'}>
            <Select
                styles={customStyles}
                defaultValue={null}
                onChange={(options) => handleStatusChange(options)}
                placeholder={t('status')}
                options={filters}
                isMulti={true}
            />
        </Element>
    )}

    {schedule.parameters.report_name && (schedule.parameters.report_name === 'product_sales' || schedule.parameters.report_name === 'invoice_items') && (
        <ProductItemsSelector setReport={setReport} />
    )}


    </>
    )
    
}

