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
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useAtom } from 'jotai';
import { 
  docuNinjaAtom
} from '$app/common/atoms/docuninja';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';
import { isPaidDocuninjaUserAtom } from '../atoms';
import { 
  LoadingState, 
  UpgradePlan, 
  SplashPage, 
  AccountCreation, 
  CompanySetup 
} from '../components/DocumentStates';
import { useDocuNinjaAdmin, useDocuNinjaPaidUser, useDocuNinjaPermission } from '$app/common/guards/guards/docuninja/permission';

export default function Documents() {
  useTitle('documents');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const company = useCurrentCompany();

  const setIsPaidDocuninjaUser = useSetAtom(isPaidDocuninjaUserAtom);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Get DocuNinja data from atom (NO QUERY!) - following app pattern
  const [docuData] = useAtom(docuNinjaAtom);
  
  console.log("docuData", docuData);
  // Use hooks that use useAtom like everything else
  const isAdmin = useDocuNinjaAdmin();
  const isPaidUser = useDocuNinjaPaidUser();
  const canCreateDocumentPermission = useDocuNinjaPermission('documents', 'create');
  
  // Get actions from the actions hook (NO QUERY!)
  const { createAccount, getToken } = useDocuNinjaActions();

  // Determine account states
  const hasAccount = !!docuData;

  // Check if company exists in DocuNinja by looking for matching company key
  const docuCompany = docuData?.companies?.find(
    (c) => c.ninja_company_key === company?.company_key
  );
  const needsCompanySetup = hasAccount && !docuCompany;
  
  // Check if company has DocuNinja modules enabled (additional data point)
  const hasDocuNinjaModules = !!company?.enable_modules;
  
  // For owners, if no account exists, it means they need plan upgrade (401 scenario)

  // For non-owners, if no account exists, they need account creation
  const needsAccountCreation = !hasAccount && !isAdmin;
  const needsPlanUpgrade = (hasAccount && docuData?.account.plan !== 'pro' && isAdmin);

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      await createAccount();
      // The service will automatically refresh and update the state
    } catch (error) {
      // Handle error silently or show user-friendly message
    } finally {
      setIsCreatingAccount(false);
    }
  };

  useEffect(() => {
    setIsPaidDocuninjaUser(isPaidUser);
  }, [isPaidUser, setIsPaidDocuninjaUser]);

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

  // Show loading state only if we don't have any specific state to show
  if (!docuData && !needsCompanySetup && !needsPlanUpgrade && !needsAccountCreation) {
    return <LoadingState pages={pages} />;
  }

  // Show upgrade page for owners without DocuNinja account (check this BEFORE needsPlanUpgrade)
  if (!hasAccount && isAdmin) {
    console.log("isAdmin");
    return <UpgradePlan pages={pages} />;
  }

  // Show plan upgrade message for non-pro users (but only if not already handled above)
  if (needsPlanUpgrade) {
    console.log("needsPlanUpgrade");
    return <UpgradePlan pages={pages} />;
  }

  // Show splash page for users without DocuNinja access
  if (!docuData && !isAdmin) {
    console.log("no docuData");
    return <SplashPage pages={pages} />;
  }


  // Show account creation UI
  if (needsAccountCreation) {
    return (
      <AccountCreation 
        pages={pages} 
        onCreateAccount={handleCreateAccount} 
        isLoading={isCreatingAccount}
      />
    );
  }

  // Show company setup UI
  if (needsCompanySetup) {
    return (
      <CompanySetup 
        pages={pages} 
        onCreateAccount={handleCreateAccount} 
        isLoading={isCreatingAccount}
      />
    );
  }

  return (
    <Default title={t('documents')} breadcrumbs={pages}>
      <div className="flex flex-col gap-y-4">

        {canCreateDocumentPermission && (
          <DocumentCreationDropZone />
        )}

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
          rightSide={isAdmin && (
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
          )}
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
