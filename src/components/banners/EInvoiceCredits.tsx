/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTranslation } from 'react-i18next';
import { Banner } from '../Banner';
import { buttonStyles } from './VerifyEmail';
import { Link, useLocation } from 'react-router-dom';
import {
  useEInvoiceHealthCheck,
  useQuota,
} from '$app/pages/settings/e-invoice/peppol/Preferences';
import { Modal } from '../Modal';
import { useEffect, useState } from 'react';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { atom, useAtom } from 'jotai';

export const EINVOICE_CREDITS_MIN_THRESHOLD = 15;

export function EInvoiceCredits() {
  const company = useCurrentCompany();
  const quota = useQuota();

  const [isVisible, setVisible] = useState(false);

  const { data: healthcheck } = useEInvoiceHealthCheck();
  const { t } = useTranslation();

  if (
    !company.legal_entity_id ||
    company.settings.e_invoice_type !== 'PEPPOL' ||
    import.meta.env.VITE_ENABLE_PEPPOL_STANDARD !== 'true'
  ) {
    return null;
  }

  if (typeof healthcheck === 'boolean' && !healthcheck) {
    return <RegenerateToken />;
  }

  if (quota !== null && quota <= 0) {
    return (
      <>
        <Dialog
          isVisible={isVisible}
          setVisible={setVisible}
          text={t('notification_no_credits')}
        />

        <Banner variant="red">
          <div className="flex space-x-1">
            <span>{t('notification_no_credits')}</span>

            <span className={buttonStyles} onClick={() => setVisible(true)}>
              {t('learn_more')}
            </span>
          </div>
        </Banner>
      </>
    );
  }

  if (quota !== null && quota < EINVOICE_CREDITS_MIN_THRESHOLD) {
    return (
      <>
        <Dialog
          isVisible={isVisible}
          setVisible={setVisible}
          text={t('notification_credits_low')}
        />

        <Banner variant="orange">
          <div className="flex space-x-1">
            <span>{t('notification_credits_low')}</span>

            <span className={buttonStyles} onClick={() => setVisible(true)}>
              {t('learn_more')}
            </span>
          </div>
        </Banner>
      </>
    );
  }

  return null;
}

interface DialogProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  text: string;
}

function Dialog({ isVisible, setVisible, text }: DialogProps) {
  const { t } = useTranslation();

  const accentColor = useAccentColor();
  const quota = useQuota();
  const location = useLocation();

  useEffect(() => {
    setVisible(false);
  }, [location.pathname]);

  return (
    <Modal
      visible={isVisible}
      onClose={() => setVisible(false)}
      title={t('credits')}
    >
      <p>{t('peppol_credits_info')}</p>
      <p>{text}</p>
      <p className="font-medium">
        {t('total_credits_amount')}: {quota}
      </p>

      <Link to="/settings/e_invoice" style={{ color: accentColor }}>
        {t('view_settings')}
      </Link>
    </Modal>
  );
}

const retriesAtom = atom(0);
const statusAtom = atom<'pending' | 'error' | 'success'>('pending');

function RegenerateToken() {
  const { t } = useTranslation();

  const refresh = useRefreshCompanyUsers();
  const queryClient = useQueryClient();

  const [status, setStatus] = useAtom(statusAtom);
  const [retries, setRetries] = useAtom(retriesAtom);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'success' || status === 'error' || retries >= 3) {
        clearInterval(interval);
        return;
      }

      request('POST', endpoint(`/api/v1/einvoice/token/update`))
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ['/api/v1/einvoice/quota'],
          });

          queryClient.invalidateQueries({
            queryKey: ['/api/v1/einvoice/health_check'],
          });

          refresh();
          setStatus('success');
        })
        .catch(() => {
          setRetries((prevRetries) => {
            const newRetries = prevRetries + 1;

            if (newRetries >= 3) {
              setStatus('error');
            }

            return newRetries;
          });
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [status, retries, queryClient, refresh, setStatus, setRetries]);

  if (status === 'success' || status === 'pending') {
    return null;
  }

  return (
    <Banner variant="red">
      <div className="flex space-x-1">
        <span>{t('einvoice_token_not_found')}</span>
      </div>
    </Banner>
  );
}
