/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from '$app/components/layouts/Default';
import { Card } from '$app/components/cards';
import { Button, Link } from '$app/components/forms';
import { Send, Star, Clock, CheckCircle } from 'react-feather';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { toast } from '$app/common/helpers/toast/toast';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';

export default function Join() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { isAdmin, isOwner } = useAdmin();
  const [isCreating, setIsCreating] = useState(false);
  const { createAccount } = useDocuNinjaActions();
  const [t] = useTranslation();

  const isEligible =
    account?.plan === 'pro' || account?.plan === 'enterprise';

  useEffect(() => {
    if (account && account.docuninja_num_users > 0) {
      navigate('/docuninja', { replace: true });
    }
  }, [account, navigate]);

  const create = () => {
    setIsCreating(true);

    createAccount()
      .then(() => {
        navigate('/docuninja');
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => setIsCreating(false));
  };

  return (
    <Default
      title={t('welcome_to_docuninja')}
      breadcrumbs={[{ name: t('docuninja'), href: '/docuninja/join' }]}
    >
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-40 h-10 rounded mx-auto mb-4 flex items-center justify-center">
              <img
                src="https://docuninja.co/wp-content/uploads/2025/03/logo.svg"
                alt={t('docuninja')}
                className="size-32 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold mb-3">{t('welcome_to_docuninja')}</h1>
            <p className="text-lg opacity-80 max-w-lg mx-auto">
              {t('docuninja_join_tagline')}
            </p>
          </div>

          <Card
            className="shadow mb-6"
            title={
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>{t('docuninja_join_features_title')}</span>
              </div>
            }
            withoutHeaderBorder
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NonClickableElement className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">
                    {t('docuninja_join_esignatures')}
                  </h3>
                  <p className="text-sm opacity-70">
                    {t('docuninja_join_esignatures_help')}
                  </p>
                </div>
              </NonClickableElement>

              <NonClickableElement className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{t('templates')}</h3>
                  <p className="text-sm opacity-70">
                    {t('docuninja_join_templates_help')}
                  </p>
                </div>
              </NonClickableElement>

              <NonClickableElement className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-1">
                    {t('docuninja_join_integration')}
                  </h3>
                  <p className="text-sm opacity-70">
                    {t('docuninja_join_integration_help')}
                  </p>
                </div>
              </NonClickableElement>
            </div>
          </Card>

          <div className="text-center">
            {isOwner || isAdmin ? (
              isEligible ? (
                <Button
                  type="primary"
                  behavior="button"
                  onClick={create}
                  disabled={isCreating}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isCreating
                    ? t('docuninja_creating_account')
                    : t('create_docuninja_account')}
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm opacity-70 mb-3">
                    {t('upgrade_plan_docuninja')}
                  </p>
                  <Link to="/settings/account_management">
                    <Button type="primary" behavior="button">
                      {t('upgrade')}
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              <p className="text-sm opacity-70">
                {t('docuninja_contact_admin_for_access')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Default>
  );
}
