/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useParams } from 'react-router-dom';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import React from 'react';
import { useGenerateActivityElement } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { AxiosResponse } from 'axios';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';

export default function Activities() {
    const { id } = useParams();

    const [t] = useTranslation();

    const { data: activities } = useQuery({
        queryKey: ['/api/v1/activities/entity', id],
        queryFn: () =>
            request('POST', endpoint('/api/v1/activities/entity'), {
                entity: 'client',
                entity_id: id,
            }).then(
                (
                    response: AxiosResponse<GenericManyResponse<ActivityRecord>>
                ) => response.data.data
            ),
        enabled: id !== null,
        staleTime: Infinity,
    });

    const activityElement = useGenerateActivityElement();

    return (
        <Card
            title={t('recent_activity')}
            className="h-full relative"
            withoutBodyPadding
        >

            <div className="pl-6 pr-4 ">
                <div
                    className="flex flex-col overflow-y-auto pr-4"
                >
                    {activities &&
                        activities.map((record: ActivityRecord, index: number) => (
                            <React.Fragment key={index}>
                                {activityElement(record)}
                            </React.Fragment>
                        ))}
                </div>
            </div>
        </Card>
    );
}
