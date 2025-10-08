/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Default } from '$app/components/layouts/Default';
import { Page } from '$app/components/Breadcrumbs';
import { Button } from '$app/components/forms';
import { useNavigate } from 'react-router-dom';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';

interface DocumentStateProps {
  pages: Page[];
}

export function LoadingState({ pages }: DocumentStateProps) {
  const [t] = useTranslation();

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

export function UpgradePlan({ pages }: DocumentStateProps) {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();

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

export function SplashPage({ pages }: DocumentStateProps) {
  const [t] = useTranslation();

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

interface AccountCreationProps extends DocumentStateProps {
  onCreateAccount: () => void;
  isLoading: boolean;
}

export function AccountCreation({ pages, onCreateAccount, isLoading }: AccountCreationProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

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
              onClick={onCreateAccount}
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

interface CompanySetupProps extends DocumentStateProps {
  onCreateAccount: () => void;
  isLoading: boolean;
}

export function CompanySetup({ pages, onCreateAccount, isLoading }: CompanySetupProps) {
  const [t] = useTranslation();

  return (
    <Default title={t('documents')} breadcrumbs={pages}>
      <div className="flex flex-col items-center gap-4 p-6">
        <p className="text-gray-600 mb-4">Welcome to DocuNinja!</p>
        <p className="text-gray-600 mb-4">
          Your account exists but this company is not set up yet. Please
          click the button below to set it up.
        </p>
        <Button
          onClick={onCreateAccount}
          disabled={isLoading}
          behavior="button"
        >
          {t('setup_company')}
        </Button>
      </div>
    </Default>
  );
}
