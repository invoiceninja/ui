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
import { DataTable } from '$app/components/DataTable';
import { useTableColumns } from '../common/hooks/useTableColumns';
import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { Default } from '$app/components/layouts/Default';
import { Page } from '$app/components/Breadcrumbs';
import { Button } from '$app/components/forms';
import { useNavigate } from 'react-router-dom';
import { Gear } from '$app/components/icons/Gear';
import { DocumentCreationDropZone } from '../common/components/DocumentCreationDropZone';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { cloneDeep } from 'lodash';
import { useDocuNinjaData, useDocuNinjaActions, useDocuNinjaTokenReady } from '$app/common/hooks/useDocuNinja';
import { isPaidDocuninjaUserAtom, docuCompanyAccountDetailsAtom } from '../atoms';

export default function Documents() {
  useTitle('documents');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const company = useCurrentCompany();

  const setIsPaidDocuninjaUser = useSetAtom(isPaidDocuninjaUserAtom);
  const [docuCompanyAccountDetails, setDocuCompanyAccountDetails] = useAtom(
    docuCompanyAccountDetailsAtom
  );

  // Get DocuNinja data from the service (already loaded by guard)
  const docuData = useDocuNinjaData();
  const { getToken } = useDocuNinjaActions();
  const isTokenReady = useDocuNinjaTokenReady();

  const isPaidUser =
    docuData?.account?.plan !== 'free' &&
    new Date(docuData?.account?.plan_expires ?? '') > new Date();

  useEffect(() => {
    setIsPaidDocuninjaUser(isPaidUser);
  }, [isPaidUser, setIsPaidDocuninjaUser]);

  useEffect(() => {
    const docuAccount = docuData?.account;
    const docuCompany = docuData?.companies?.find(
      (c) => c.ninja_company_key === company?.company_key
    );

    if (docuAccount && docuCompany) {
      setDocuCompanyAccountDetails(
        cloneDeep({
          account: docuAccount,
          company: docuCompany,
        })
      );
    } else {
      setDocuCompanyAccountDetails(null);
    }
  }, [docuData, company, setDocuCompanyAccountDetails]);

  useSocketEvent({
    on: [
      'App\\Events\\Document\\DocumentWasSigned',
      'App\\Events\\DocumentFile\\DocumentFilePreviewGenerated',
    ],
    callback: () =>
      $refetch(['docuninja_documents', 'docuninja_document_timeline']),
  });

  const columns = useTableColumns();

  const pages: Page[] = [
    {
      name: t('documents'),
      href: '/documents',
    },
  ];

  // Show loading state if token is not ready (e.g., during company switch)
  if (!isTokenReady) {
    return (
      <Default title={t('documents')} breadcrumbs={pages}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}...</p>
          </div>
        </div>
      </Default>
    );
  }

  return (
    <Default title={t('documents')} breadcrumbs={pages}>
      <div className="flex flex-col gap-y-4">
        <DocumentCreationDropZone />

        <DataTable<Document>
          queryIdentificator="/api/documents/docuninja"
          resource="document"
          endpoint="/api/documents?sort=id|desc"
          columns={columns}
          withResourcefulActions
          bulkRoute="/api/documents/bulk"
          linkToEdit="/documents/:id/builder"
          useDocuNinjaApi
          endpointHeaders={{
            Authorization: `Bearer ${getToken()}`,
          }}
          totalPagesPropPath="data.meta.last_page"
          totalRecordsPropPath="data.meta.total"
          withoutActionBulkPayloadPropertyForDeleteAction
          withoutIdsBulkPayloadPropertyForDeleteAction
          useDeleteMethod
          deleteBulkRoute="/api/documents/bulk"
          rightSide={
            <Button
              behavior="button"
              type="secondary"
              onClick={() => navigate('/documents/settings')}
            >
              <div className="flex items-center space-x-2">
                <div>
                  <Gear />
                </div>

                <span>{t('settings')}</span>
              </div>
            </Button>
          }
          showEdit={(document) =>
            document?.status_id !== DocumentStatus.Completed &&
            document?.status_id !== DocumentStatus.Voided
          }
          filterParameterKey="search"
        />
      </div>
    </Default>
  );
}
