import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { Button } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useEffect, useState } from 'react';
import { Alert } from '$app/components/Alert';
import { Account, Company } from '$app/common/interfaces/docuninja/api';
import { useNavigate } from 'react-router-dom';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useQueryClient } from 'react-query';
import { useLogin } from '$app/common/queries/docuninja/docuninja';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { Spinner } from '$app/components/Spinner';
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { cloneDeep } from 'lodash';

export const isPaidDocuninjaUserAtom = atom<boolean>(false);

type DocuCompanyAccountDetails = {
  account: Account;
  company: Company;
};

export const docuCompanyAccountDetailsAtom =
  atom<DocuCompanyAccountDetails | null>(null);

export default function Document() {
  const { documentTitle } = useTitle('documents');

  const [t] = useTranslation();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const account = useCurrentAccount();

  const setIsPaidDocuninjaUser = useSetAtom(isPaidDocuninjaUserAtom);
  const [docuCompanyAccountDetails, setDocuCompanyAccountDetails] = useAtom(
    docuCompanyAccountDetailsAtom
  );

  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const pages = [{ name: t('documents'), href: '/documents' }];

  const {
    data: docuData,
    isLoading,
    error: loginError,
  } = useLogin({
    enabled:
      (account?.plan === 'pro' || account?.plan === 'enterprise') &&
      Boolean(company?.company_key),
  });

  const is401Error =
    loginError && (loginError as any)?.response?.status === 401;
  const hasAccount = !!docuData && !is401Error;
  const needsAccountCreation = is401Error;

  const isPaidUser =
    docuCompanyAccountDetails?.account?.plan !== 'free' &&
    new Date(docuCompanyAccountDetails?.account?.plan_expires ?? '') >
      new Date();

  const create = () => {
    setError(null);
    setIsCreating(true);

    request(
      'POST',
      endpoint('/api/docuninja/create'),
      {},
      { skipIntercept: true }
    )
      .then(() => {
        queryClient.invalidateQueries(['/api/docuninja/login']);
      })
      .catch((error) => {
        setError(
          error.response.data.error ?? 'Failed to create Docuninja account'
        );
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  useEffect(() => {
    if (loginError && !is401Error && !error) {
      setError(t('fetch_docuninja_failed'));
    }
  }, [loginError, is401Error, error]);

  useEffect(() => {
    setIsPaidDocuninjaUser(isPaidUser);
  }, [isPaidUser]);

  useEffect(() => {
    if (docuData) {
      const docuCompany = docuData?.companies?.find(
        (c: Company) => c.ninja_company_key === company?.company_key
      );

      if (docuCompany) {
        localStorage.setItem('X-DOCU-NINJA-TOKEN', docuCompany?.token);
      }
    }
  }, [docuData, company]);

  useEffect(() => {
    const docuAccount = docuData?.account;
    const docuCompany = docuData?.companies?.find(
      (c: Company) => c.ninja_company_key === company?.company_key
    );

    setDocuCompanyAccountDetails(
      cloneDeep({
        account: docuAccount,
        company: docuCompany,
      })
    );
  }, [docuData]);

  useSocketEvent({
    on: [
      'App\\Events\\Document\\DocumentWasSigned',
      'App\\Events\\DocumentFile\\DocumentFilePreviewGenerated',
    ],
    callback: () =>
      $refetch(['docuninja_documents', 'docuninja_document_timeline']),
  });

  // if (
  //   !isLoading &&
  //   !(
  //     docuCompanyAccountDetails?.account?.plan !== 'pro' ||
  //     needsAccountCreation ||
  //     Boolean(hasAccount && !docuCompanyAccountDetails?.company)
  //   )
  // ) {
  //   return <Outlet />;
  // }

  return (
    <Default title={documentTitle} breadcrumbs={pages} docsLink="en/documents">
      {error && !isLoading && (
        <Alert type="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          {import.meta.env.VITE_IS_DOCUNINJA_IN_BETA === 'true' ? (
            <div className="flex justify-center items-center">
              <Card
                className="shadow-sm min-w-[20rem]"
                style={{ borderColor: colors.$24 }}
              >
                <div className="flex flex-col items-center gap-4 p-6 max-w-2xl">
                  <span
                    className="text-xl font-semibold"
                    style={{ color: colors.$3 }}
                  >
                    {t('welcome_to_docuninja')}
                  </span>

                  <div className="flex flex-col gap-3 text-center">
                    <span style={{ color: colors.$17 }}>
                      {t('docuninja_beta_description')}
                    </span>

                    <span style={{ color: colors.$17 }}>
                      {t('beta_trial_info')}
                    </span>
                  </div>

                  <Button
                    className="mt-4"
                    disabled={isCreating || isLoading}
                    behavior="button"
                  >
                    {t('start_trial')}
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <>
              {docuCompanyAccountDetails?.account?.plan !== 'pro' && (
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
              )}

              {Boolean(needsAccountCreation) && (
                <div className="flex justify-center items-center">
                  <Card
                    className="shadow-sm"
                    style={{ borderColor: colors.$24 }}
                  >
                    <div className="flex flex-col items-center gap-4 p-6">
                      <span style={{ color: colors.$3 }}>
                        {t('welcome_to_docuninja')}
                      </span>

                      <span
                        className="text-center"
                        style={{ color: colors.$17 }}
                      >
                        {t('create_docuninja_account')}
                      </span>

                      <Button
                        className="mt-4"
                        onClick={() => create()}
                        disabled={isCreating || isLoading}
                        behavior="button"
                      >
                        {t('create')}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {Boolean(hasAccount && !docuCompanyAccountDetails?.company) && (
                <div className="flex flex-col items-center gap-4 p-6">
                  <p className="text-gray-600 mb-4">Welcome to DocuNinja!</p>
                  <p className="text-gray-600 mb-4">
                    Your account exists but this company is not set up yet.
                    Please click the button below to set it up.
                  </p>
                  <Button
                    onClick={() => create()}
                    disabled={isCreating || isLoading}
                    behavior="button"
                  >
                    {t('setup_company')}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Default>
  );
}
