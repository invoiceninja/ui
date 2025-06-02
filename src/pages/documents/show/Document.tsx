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
import { useDocumentQuery } from '$app/common/queries/docuninja/documents';
import { Page } from '$app/components/Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Default } from '$app/components/layouts/Default';
import { Alert } from '$app/components/Alert';
import { useState } from 'react';


export default function Document() {
    const { documentTitle, setDocumentTitle } = useTitle('view_document');
    const [t] = useTranslation();

    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();
    const { data: document, isLoading } = useDocumentQuery({
        id,
        enabled: true,
    });

    const pages: Page[] = [
        { name: t('documents'), href: '/documents' },
        {
            name: documentTitle,
            href: route('/documents/:id', { id }),
        },
    ];


    return (
        
        <Default title={documentTitle} breadcrumbs={pages} docsLink="en/documents">
            {error && (
                <Alert type="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            
            <div>
                <p>{document?.description}</p>
            </div>

        </Default>
    );
}
