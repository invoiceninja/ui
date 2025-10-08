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
import { useDocuNinjaData, useDocuNinjaActions, useDocuNinjaTokenReady, useDocuNinjaLoading } from '$app/common/hooks/useDocuNinja';
import { isPaidDocuninjaUserAtom, docuCompanyAccountDetailsAtom } from '../atoms';
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { useDocuNinjaAdmin } from '$app/pages/documents/hooks/useDocuNinjaPermissions';

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
  const { getToken, createAccount } = useDocuNinjaActions();
  const isTokenReady = useDocuNinjaTokenReady();
  const isLoading = useDocuNinjaLoading();
  const colors = useColorScheme();
  const isAdmin = useDocuNinjaAdmin();

  const isPaidUser =
    docuData?.account?.plan !== 'free' &&
    new Date(docuData?.account?.plan_expires ?? '') > new Date();

  // Determine account states
  const hasAccount = !!docuData?.account;
  
  // Check if company exists in DocuNinja by looking for matching company key
  const docuCompany = docuData?.companies?.find(
    (c) => c.ninja_company_key === company?.company_key
  );
  const needsCompanySetup = hasAccount && !docuCompany;
  
  // Check if company has DocuNinja modules enabled (additional data point)
  const hasDocuNinjaModules = !!company?.enable_modules;
  
  // For owners, if no account exists, it means they need plan upgrade (401 scenario)
  // For non-owners, if no account exists, they need account creation
  const needsAccountCreation = !hasAccount && isTokenReady && !isLoading && !isAdmin;
  const needsPlanUpgrade = !hasDocuNinjaModules || (hasAccount && docuData?.account?.plan !== 'pro') || 
                          (isAdmin && !hasAccount && isTokenReady && !isLoading);

  // Debug logging
  console.log('Documents Debug:', {
    isTokenReady,
    hasAccount,
    isAdmin,
    needsPlanUpgrade,
    needsAccountCreation,
    needsCompanySetup,
    hasDocuNinjaModules,
    docuData: !!docuData,
    companyUser: docuData?.company_user,
    isOwner: docuData?.company_user?.is_owner,
    isAdminFromData: docuData?.company_user?.is_admin
  });



  const handleCreateAccount = async () => {
    try {
      await createAccount();
      // The service will automatically refresh and update the state
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  };

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

  // Show loading state only if we're actually loading and don't have any specific state to show
  if (isLoading && !needsCompanySetup && !needsPlanUpgrade && !needsAccountCreation) {
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

  // Show upgrade page for owners without DocuNinja account (check this BEFORE needsPlanUpgrade)
  if (!hasAccount && isAdmin) {
    return (
      <Default title={t('documents')} breadcrumbs={pages}>
        <div className="flex flex-col items-center gap-4 p-6">
          <span style={{ color: colors.$17 }}>
            {t('upgrade_plan_docuninja')}
          </span>

          <Button
            onClick={() => navigate('/settings/account_management')}
            behavior="button"
          >
            {t('upgrade_plan')}
          </Button>
        </div>
      </Default>
    );
  }

  // Show plan upgrade message for non-pro users (but only if not already handled above)
  if (needsPlanUpgrade) {
    return (
      <Default title={t('documents')} breadcrumbs={pages}>
        <div className="flex flex-col items-center gap-4 p-6">
          <span style={{ color: colors.$17 }}>
            {t('upgrade_plan_docuninja')}
          </span>

          <Button
            onClick={() => navigate('/settings/account_management')}
            behavior="button"
          >
            {t('upgrade_plan')}
          </Button>
        </div>
      </Default>
    );
  }

  // Show splash page for users without DocuNinja access
  if (!hasAccount || (hasAccount && !isAdmin)) {
    return (
      <Default title={t('documents')} breadcrumbs={pages}>
        <div className="flex items-center justify-center py-8">
          <Card className="shadow-sm max-w-md">
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-xl font-semibold text-gray-800">
                {t('documents')}
              </h2>
              <p className="text-gray-600">
                {t('documents_splash_message')}
              </p>
              <p className="text-sm text-gray-500">
                {t('contact_admin_for_access')}
              </p>
            </div>
          </Card>
        </div>
      </Default>
    );
  }


  // Show account creation UI
  if (needsAccountCreation) {
    return (
      <Default title={t('documents')} breadcrumbs={pages}>
        <div className="flex justify-center items-center">
          <Card className="shadow-sm" style={{ borderColor: colors.$24 }}>
            <div className="flex flex-col items-center gap-4 p-6">
              <span style={{ color: colors.$3 }}>
                {t('welcome_to_docuninja')}
              </span>

              <span className="text-center" style={{ color: colors.$17 }}>
                {t('create_docuninja_account')}
              </span>

              <Button
                className="mt-4"
                onClick={handleCreateAccount}
                disabled={isLoading}
                behavior="button"
              >
                {t('create')}
              </Button>
            </div>
          </Card>
        </div>
      </Default>
    );
  }

  // Show company setup UI
  if (needsCompanySetup) {
    return (
      <Default title={t('documents')} breadcrumbs={pages}>
        <div className="flex flex-col items-center gap-4 p-6">
          <p className="text-gray-600 mb-4">Welcome to DocuNinja!</p>
          <p className="text-gray-600 mb-4">
            Your account exists but this company is not set up yet. Please
            click the button below to set it up.
          </p>
          <Button
            onClick={handleCreateAccount}
            disabled={isLoading}
            behavior="button"
          >
            {t('setup_company')}
          </Button>
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
