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
import { useTranslation } from 'react-i18next';
import { useDocumentsQuery } from '$app/common/queries/docuninja/documents';
import { useState } from 'react';
import { MoreHorizontal, FileText, Download, Eye, Trash2 } from 'react-feather';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { Td } from '$app/components/tables/Td';
import { Icon } from '$app/components/icons/Icon';
import { MdEdit, MdViewCozy } from 'react-icons/md';
import { route } from '$app/common/helpers/route';

interface DocumentFile {
    id: string;
    filename: string;
    mime_type: string;
    page_position: number;
    page_count: number;
    metadata: any[];
    url: string | null;
    previews: string[];
    created_at: string;
    updated_at: string;
}

interface Document {
    id: string;
    description: string;
    status_id: number;
    is_deleted: boolean;
    user_id: string;
    files: DocumentFile[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

const STATUS_LABELS = {
    1: 'Draft',
    2: 'Sent',
    3: 'Viewed',
    4: 'Completed',
    5: 'Cancelled'
};

const STATUS_COLORS = {
    1: 'bg-gray-100 text-gray-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-green-100 text-green-800',
    5: 'bg-red-100 text-red-800'
};

export default function Documents() {
    useTitle('documents');

    const [t] = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [filter, setFilter] = useState('');

    const { data: documentsResponse, isLoading, error } = useDocumentsQuery({
        currentPage: currentPage.toString(),
        perPage: perPage.toString(),
        filter
    });

    const documents = documentsResponse?.data?.data || [];
    const pagination: PaginationMeta = documentsResponse?.data?.meta || {} as PaginationMeta;

    // Debug logging
    console.log('Documents Response:', documentsResponse);
    console.log('Documents Array:', documents);
    console.log('Pagination Meta:', pagination);
    console.log('Documents Length:', documents.length);

    const handleMenuAction = (action: string, document: Document) => {
        switch (action) {
            case 'view':
                console.log('View document:', document.id);
                break;
            case 'download':
                console.log('Download document:', document.id);
                break;
            case 'delete':
                console.log('Delete document:', document.id);
                break;
            default:
                break;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusBadge = (statusId: number) => {
        const label = STATUS_LABELS[statusId as keyof typeof STATUS_LABELS] || 'Unknown';
        const colorClass = STATUS_COLORS[statusId as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded shadow">
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-600">{t('loading')}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded shadow">
                <div className="p-6 text-center">
                    <p className="text-red-600">Error loading documents: {(error as any)?.message || 'Unknown error'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded shadow overflow-hidden">
            {/* Header with search */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">{t('documents')}</h2>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder={t('search') as string}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('document')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Files
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('status')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <span className="">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((document: Document) => (
                            <tr key={document.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {document.description || 'Untitled Document'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {document.id.slice(-8)}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {document.files.length > 0 ? (
                                            <div>
                                                <div className="font-medium">
                                                    {document.files[0].filename}
                                                </div>
                                                {document.files.length > 1 && (
                                                    <div className="text-xs text-gray-500">
                                                        +{document.files.length - 1} more files
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500">
                                                    {document.files[0].page_count} {document.files[0].page_count === 1 ? 'page' : 'pages'}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">No files</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(document.status_id)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {document.files.length > 0 ? formatDate(document.files[0].created_at) : '-'}
                                </td>
                                <Td>
                                    <Dropdown label={t('actions')}>
                                        <DropdownElement
                                            to={route('/documents/:id', {
                                                id: document.id,
                                            })}
                                            icon={<Icon element={MdViewCozy} />}
                                        >
                                            {t('view')}
                                        </DropdownElement>
                                    </Dropdown>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {documents.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage <= 1 || !pagination.links?.[0]?.url}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= (pagination.last_page || 1) || !pagination.links?.[pagination.links.length - 1]?.url}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">{pagination.from || 1}</span>{' '}
                                to{' '}
                                <span className="font-medium">{pagination.to || documents.length}</span>{' '}
                                of{' '}
                                <span className="font-medium">{pagination.total || documents.length}</span>{' '}
                                results
                            </p>
                            
                            {/* Per Page Selector */}
                            <div className="flex items-center space-x-2 ml-auto">
                                <label className="text-sm text-gray-700 font-medium">Show:</label>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(parseInt(e.target.value));
                                        setCurrentPage(1); // Reset to first page when changing per page
                                    }}
                                    className="border border-gray-300 rounded-md text-sm px-3 py-1.5 min-w-[80px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="1">1</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-700">per page</span>
                            </div>
                        </div>
                        
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                {/* Previous Button */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(pagination.current_page - 1)}
                                    disabled={!pagination.links?.[0]?.url}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                {pagination.links?.slice(1, -1).map((link, index) => {
                                    const pageNumber = parseInt(link.label);
                                    const isCurrentPage = link.active;
                                    
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => link.url && setCurrentPage(pageNumber)}
                                            disabled={!link.url}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                isCurrentPage
                                                    ? 'z-10 bg-primary border-primary text-black font-bold'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                            aria-current={isCurrentPage ? 'page' : undefined}
                                        >
                                            {link.label}
                                        </button>
                                    );
                                })}

                                {/* Show ellipsis if there are more pages */}
                                {pagination.last_page > 5 && pagination.current_page < pagination.last_page - 2 && (
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        ...
                                    </span>
                                )}

                                {/* Always show last page if there are many pages */}
                                {pagination.last_page > 5 && pagination.current_page < pagination.last_page - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(pagination.last_page)}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        {pagination.last_page}
                                    </button>
                                )}

                                {/* Next Button */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(pagination.current_page + 1)}
                                    disabled={!pagination.links?.[pagination.links.length - 1]?.url}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {documents.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
                </div>
            )}
        </div>
    );
}