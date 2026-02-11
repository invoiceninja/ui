import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { Plan } from './Plan';
import { UpgradeModal } from '$app/pages/documents/common/components/UpgradeModal';
import { Button } from '$app/components/forms';
import { useState } from 'react';
import { Check } from 'react-feather';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useColorScheme } from '$app/common/colors';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';
import { Alert } from '$app/components/Alert';

export function DocuNinja() {
  const accentColor = useAccentColor();
  const colors = useColorScheme();

  const account = useCurrentAccount();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [docuData] = useAtom(docuNinjaAtom);
  
  const { createAccount, flushData } = useDocuNinjaActions();

  function createDocuNinjaAccount() {
    setError(null);
    setIsCreating(true);

    createAccount()
      .catch((error: any) => {
        setError(
          error.response?.data?.error ?? 'Failed to create Docuninja account'
        );
      })
      .finally(() => {
        setIsCreating(false);
      });
  }

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const docuAccount = docuData?.account;
  
  return (
    <Card>
      <div className="px-7 py-3 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">{t('docuninja')}</h4>
        </div>

        {error && (
          <Alert type="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {docuAccount?.plan === 'pro' ? (
          <div className="py-3 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Your Plan</h4>
            </div>
            <Plan
              title={
                <p>
                  {t('enterprise')} ({docuAccount.num_users || 0}{' '}
                  <span className="lowercase">{t('users')}</span>)
                </p>
              }
              color={'#000000'}
              price={`${6 * (docuAccount.num_users || 0)}`} //@todo - this has been hardcoded.
              trial={false}
              custom={false}
              term="month"
            />
          </div>
        ) : null}

        {docuAccount?.plan === 'free' ? (
          <div className="py-3 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Your Plan</h4>
            </div>
            <Plan
              title={
                <p>
                  {t('free_trial')} ({docuAccount.num_users || 0}{' '}
                  <span className="lowercase">{t('users')}</span>)
                </p>
              }
              color={'#000000'}
              price={`${0 * (docuAccount.num_users || 0)}`}
              trial={false}
              custom={false}
              term="month"
            />
          </div>
        ) : null}

        <div
          className="rounded p-4 flex flex-col 2xl:flex-row justify-between items-center space-y-5 2xl:space-y-0"
          style={{ backgroundColor: colors.$2 }}
        >
          <div className="flex flex-col space-y-2">
            <p className="font-semibold text-center 2xl:text-left">
              Experience connected Document Management and Invoicing with
              DocuNinja!
            </p>

            <div className="grid grid-cols-2 gap-20 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Pro</h3>
                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Create unlimited documents</span>
                </p>
                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">
                    Capture esignatures at checkout!
                  </span>
                </p>
                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Advanced Customization</span>
                </p>
                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">
                    Embed signing links in documents
                  </span>
                </p>
              </div>
            </div>
          </div>

          {!docuAccount && (
            <div className="flex flex-col space-y-2 items-center">
              <p>Get started with DocuNinja!</p>

              <Button
                onClick={() => createDocuNinjaAccount()}
                behavior="button"
                disabled={isCreating}
              >
                {t('create')}
              </Button>
            </div>
          )}

          {docuAccount && (docuAccount.num_users || 0) < account.num_users && (
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => setShowUpgradeModal(true)}
                behavior="button"
              >
                {t('upgrade_now')}
              </Button>

              <UpgradeModal
                visible={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onPaymentComplete={() => {
                  flushData();
                  setShowUpgradeModal(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
