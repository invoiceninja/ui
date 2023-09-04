/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import React from 'react';
import { SearchRecord } from '$app/common/interfaces/search';
import { route } from '$app/common/helpers/route';
import { Link } from 'react-router-dom';

export function Search() {
    const [t] = useTranslation();

    const { data, isLoading, isError } = useQuery(
        '/api/v1/search',
        () => request('POST', endpoint('/api/v1/search')),
        { staleTime: Infinity }
    );

    return (
        <Card
            title={t('search')}
            className="h-96 relative"
            withoutBodyPadding
            withoutHeaderBorder
        >
            {isLoading && (
                <NonClickableElement>
                    <Spinner />
                </NonClickableElement>
            )}

            {isError && (
                <NonClickableElement>{t('error_refresh_page')}</NonClickableElement>
            )}

            <div className="pl-6 pr-4">
                <div
                    className="flex flex-col overflow-y-auto pr-4"
                    style={{ height: '19.9rem' }}
                >
                    <h3>Clients</h3>
                    {data?.data &&
                        data.data.clients.map((record: SearchRecord, index: number) => (
                            <React.Fragment key={index}>
                                <Link
                                    to={route(record.path)}
                                >
                                    {record.name}
                                </Link>
                            </React.Fragment>
                        ))}
                    <h3>Client Contacts</h3>
                    {data?.data &&
                        data.data.client_contacts.map((record: SearchRecord, index: number) => (
                            <React.Fragment key={index}>
                                <Link
                                    to={route(record.path)}
                                >
                                    {record.name}
                                </Link>
                            </React.Fragment>
                        ))}
                    <h3>Invoices</h3>
                    {data?.data &&
                        data.data.invoices.map((record: SearchRecord, index: number) => (
                            <React.Fragment key={index}>
                                <Link
                                    to={route(record.path)}
                                >
                                    {record.name}
                                </Link>
                            </React.Fragment>
                        ))}
                    <h3>Settings</h3>
                    {data?.data &&
                        data.data.settings.map((record: SearchRecord, index: number) => (
                            <React.Fragment key={index}>
                                <Link
                                    to={route(record.path)}
                                >
                                    {record.name}
                                </Link>
                            </React.Fragment>
                        ))}
                </div>
            </div>
        </Card>
    );
}
