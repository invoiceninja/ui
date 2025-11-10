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
import { Document as DocumentType } from '$app/common/interfaces/docuninja/api';
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
import { toast } from '$app/common/helpers/toast/toast';
import { useDocuNinjaAdmin, useDocuNinjaPaidUser, useDocuNinjaPermission } from '$app/common/guards/guards/docuninja/permission';
import { useActions } from '../common/hooks/useActions';
import { DocumentSettingsModal } from '../show/components/DocumentSettingsModal';

export default function Documents() {
  useTitle('documents');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const company = useCurrentCompany();

  const actions = useActions({
    onSettingsClick: (doc: DocumentType) => {
      setSelectedDocument(doc);
      setIsSettingsModalOpen(true);
    },
  });
  const setIsPaidDocuninjaUser = useSetAtom(isPaidDocuninjaUserAtom);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [docuData] = useAtom(docuNinjaAtom);
  
  // Use hooks that use useAtom like everything else
  const isAdmin = useDocuNinjaAdmin();
  const isPaidUser = useDocuNinjaPaidUser();
  const canCreateDocumentPermission = useDocuNinjaPermission('documents', 'create');
  
  const { createAccount, getToken } = useDocuNinjaActions();

  const hasAccount = !!docuData;

  // Check if company exists in DocuNinja by looking for matching company key
  const docuCompany = docuData?.companies?.find(
    (c) => c.ninja_company_key === company?.company_key
  );
  
  const needsCompanySetup = hasAccount && !docuCompany;
  
  const needsAccountCreation = !hasAccount && !isAdmin;

  const needsPlanUpgrade = (hasAccount && docuData?.account.plan !== 'pro' && isAdmin);

  function handleCreateAccount() {
    setIsCreatingAccount(true);

    createAccount()
      .catch((error: any) => {
        toast.error(error.response?.data?.error ?? 'Failed to create Docuninja account');
      })
      .finally(() => {
        setIsCreatingAccount(false);
      });

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
      name: t('docuninja'),
      href: '/docuninja',
    },
  ];

  // Show loading state only if we don't have any specific state to show
  if (!docuData && !needsCompanySetup && !needsPlanUpgrade && !needsAccountCreation) {
    return <LoadingState pages={pages} />;
  }

  // Show upgrade page for owners without DocuNinja account (check this BEFORE needsPlanUpgrade)
  if (!hasAccount && isAdmin) {
    return <UpgradePlan pages={pages} />;
  }

  // Show plan upgrade message for non-pro users (but only if not already handled above)
  if (needsPlanUpgrade) {
    return <UpgradePlan pages={pages} />;
  }

  // Show splash page for users without DocuNinja access
  if (!docuData && !isAdmin) {
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
    <Default title={t('docuninja')} breadcrumbs={pages}>
      <div className="flex flex-col gap-y-4">

        {canCreateDocumentPermission && (
          <DocumentCreationDropZone />
        )}

        <DataTable<DocumentType>
          queryIdentificator="/api/documents/docuninja"
          resource="document"
          endpoint="/api/documents?sort=id|desc"
          columns={columns}
          withResourcefulActions
          bulkRoute="/api/documents/bulk"
          linkToEdit="/docuninja/:id/builder"
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
          customActions={actions}
          rightSide={isAdmin && (
            <Button
              behavior="button"
              type="secondary"
              onClick={() => navigate('/docuninja/settings')}
            >
              <div className="flex items-center space-x-2">
                <div>
                  <Gear />
                </div>

                <span>{t('settings')}</span>
              </div>
            </Button>
          )}
          showEdit={() => true}
          // showEdit={(document: DocumentType) =>
          //   document?.status_id !== DocumentStatus.Completed &&
          //   document?.status_id !== DocumentStatus.Voided
          // }
          filterParameterKey="search"
        />
      </div>

      {selectedDocument && (
        <DocumentSettingsModal
          document={selectedDocument}
          visible={isSettingsModalOpen}
          setVisible={setIsSettingsModalOpen}
        />
      )}
    </Default>
  );
}
