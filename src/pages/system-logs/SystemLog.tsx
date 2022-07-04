/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { endpoint } from 'common/helpers';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import { Spinner } from 'components/Spinner';
import { SystemLogRecord } from 'common/interfaces/system-log';

export function SystemLog() {
    const [t] = useTranslation();
    const pages = [{ name: t('system_logs'), href: '/system_logs' }];

    const { data, isLoading } = useQuery(
        '/api/v1/system_logs',
        () => request('GET', endpoint('/api/v1/system_logs'))
    );

    // const company = useCurrentCompany();


    return (
        <Default
            title={t('system_logs')}
            breadcrumbs={pages}
        >
            {isLoading && (
                <NonClickableElement>
                    <Spinner />
                </NonClickableElement>
            )}

            {/* Stacked list */}
            <ul role="list" className="mt-5 border-t border-gray-200 divide-y divide-gray-200 sm:mt-0 sm:border-t-0">
                {data?.data?.data.map((system_log: SystemLogRecord) => (
                    <li key={system_log.id}>
                        <a href="#" className="group block">
                            <div className="flex items-center py-5 px-4 sm:py-6 sm:px-0">
                                <div className="min-w-0 flex-1 flex items-center">
                                    <div className="flex-shrink-0">
                                        <img
                                            className="h-12 w-12 rounded-full group-hover:opacity-75"
                                            src=""
                                            alt=""
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600 truncate">name</p>
                                            <p className="mt-2 flex items-center text-sm text-gray-500">
                                                <span className="truncate">email</span>
                                            </p>
                                        </div>
                                        <div className="hidden md:block">
                                            <div>
                                                <p className="text-sm text-gray-900">
                                                    Applied on 
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500">
                                                    candidate.status
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {/* <ChevronRightIcon
                                        className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                                        aria-hidden="true"
                                    /> */}
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>



        </Default>
    );
}
