/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { useDocumentQuery, useDocumentTimelineQuery } from '$app/common/queries/docuninja/documents';
import { Page } from '$app/components/Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Default } from '$app/components/layouts/Default';
import { Alert } from '$app/components/Alert';
import { useEffect, useState } from 'react';
import { Card, Element } from '$app/components/cards';
import { Badge } from '$app/components/Badge';
import { Spinner } from '$app/components/Spinner';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Icon } from '$app/components/icons/Icon';
import { MdFileDownload, MdOpenInNew, MdPictureAsPdf } from 'react-icons/md';
import { Button } from '$app/components/forms';
import { FileIcon } from '$app/components/FileIcon';
import { InputField } from '$app/components/forms';
import type { Document as DocumentType, DocumentFile } from '$app/common/interfaces/docuninja/api';
import { TimelineLayout, TimelineItemType } from './components/timeline-layout';
import { Invitations } from './components/invitations';

const STATUS_LABELS = {
    1: 'Draft',
    2: 'Sent',
    3: 'Viewed',
    4: 'Completed',
    5: 'Cancelled'
};

export default function Document() {
    const { documentTitle, setDocumentTitle } = useTitle('view_document');
    const [t] = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();

    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();

    const { data: document, isLoading } = useDocumentQuery({
        id,
        enabled: true,
    }) as { data: DocumentType | undefined, isLoading: boolean };

    const pages: Page[] = [
        { name: t('documents'), href: '/documents' },
        {
            name: document?.description || documentTitle,
            href: route('/documents/:id', { id }),
        },
    ];

    const { data: timelineData, isLoading: isTimelineLoading } = useDocumentTimelineQuery({
        id,
        enabled: true,
    });
    
    const getStatusBadge = (statusId: number) => {
        const label = STATUS_LABELS[statusId as keyof typeof STATUS_LABELS] || 'Unknown';
        
        let variant: 'primary' | 'dark-blue' | 'yellow' | 'green' | 'red' | 'orange' = 'primary';
        
        switch (statusId) {
            case 1:
                variant = 'primary';
                break;
            case 2:
                variant = 'dark-blue';
                break;
            case 3:
                variant = 'yellow';
                break;
            case 4:
                variant = 'green';
                break;
            case 5:
                variant = 'red';
                break;
            default:
                variant = 'primary';
        }
        
        return <Badge variant={variant}>{label}</Badge>;
    };

    const handleDownload = (file: DocumentFile) => {
        console.log('Download file:', file.id);
        // Implement download logic here
    };

    const handlePreview = (file: DocumentFile) => {
        console.log('Preview file:', file.id);
        // Implement preview logic here
    };

    if (isLoading) {
        return (
            <Default title={documentTitle} breadcrumbs={pages} docsLink="en/documents">
                <div className="flex justify-center items-center py-16">
                    <Spinner />
                </div>
            </Default>
        );
    }

    if (error) {
        return (
            <Default title={documentTitle} breadcrumbs={pages} docsLink="en/documents">
                <Alert type="danger" className="mb-4">
                    {error}
                </Alert>
            </Default>
        );
    }

    if (!document) {
        return (
            <Default title={documentTitle} breadcrumbs={pages} docsLink="en/documents">
                <Alert type="danger" className="mb-4">
                    {t('document_not_found')}
                </Alert>
            </Default>
        );
    }
    
    return (
        <Default title={document.description || documentTitle} breadcrumbs={pages} docsLink="en/documents">
            {error && (
                <Alert type="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <div className="grid grid-cols-3 gap-4">
                <Invitations document={document} />
                
                <div className="col-span-2 lg:col-span-2">
                    {isTimelineLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : (
                        <TimelineLayout items={timelineData || []} />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* Document Details */}
                <div className="col-span-12 lg:col-span-8">
                    <Card title={t('document_details')} className="mb-4">
                        <Element leftSide={t('description')}>
                            <InputField 
                                value={document.description || 'Untitled Document'}
                                readOnly
                            />
                        </Element>

                        <Element leftSide={t('status')}>
                            {getStatusBadge(document.status_id)}
                        </Element>

                        <Element leftSide={t('document_id')}>
                            <InputField 
                                value={document.id}
                                readOnly
                            />
                        </Element>

                        <Element leftSide={t('created_at')}>
                            <InputField 
                                value={document.created_at ? date(document.created_at, dateFormat) : '-'}
                                readOnly
                            />
                        </Element>

                        <Element leftSide={t('updated_at')}>
                            <InputField 
                                value={document.updated_at ? date(document.updated_at, dateFormat) : '-'}
                                readOnly
                            />
                        </Element>
                    </Card>
                </div>

                {/* Document Actions */}
                <div className="col-span-12 lg:col-span-4">
                    <Card title={t('actions')} className="mb-4">
                        <div className="space-y-3">
                            <Button 
                                type="primary" 
                                className="w-full"
                                onClick={() => document.files?.[0] && handlePreview(document.files[0])}
                                disabled={!document.files?.length}
                            >
                                <Icon element={MdOpenInNew} className="mr-2" />
                                {t('preview')}
                            </Button>
                            
                            <Button 
                                type="secondary" 
                                className="w-full"
                                onClick={() => document.files?.[0] && handleDownload(document.files[0])}
                                disabled={!document.files?.length}
                            >
                                <Icon element={MdFileDownload} className="mr-2" />
                                {t('download')}
                            </Button>
                        </div>
                    </Card>
                </div>

            </div>

        </Default>
    );
}
