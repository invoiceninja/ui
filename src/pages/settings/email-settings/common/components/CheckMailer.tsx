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
import { Alert } from '$app/components/Alert';
import { Element } from '$app/components/cards';
import { Button, Link } from '$app/components/forms';
import {
  isOAuthMailer,
  MAILER_CHECK_FIELD_LABELS,
} from '../helpers/mailer-check';
import { MailerCheckResult } from '../hooks/useCheckMailer';

interface Props {
  mailer: string | undefined;
  disabled: boolean;
  isFormBusy: boolean;
  missingFields: string[];
  secondsRemaining: number;
  recipient: string | undefined;
  result: MailerCheckResult | undefined;
  onClick: () => void;
}

export function CheckMailer(props: Props) {
  const [t] = useTranslation();

  const {
    mailer,
    disabled,
    isFormBusy,
    missingFields,
    secondsRemaining,
    recipient,
    result,
    onClick,
  } = props;

  const missingFieldsLabel = missingFields.length
    ? `${t('required_fields')}: ${missingFields
        .map((field) => t(MAILER_CHECK_FIELD_LABELS[field]))
        .join(', ')}`
    : undefined;

  return (
    <>
      <Element pushContentToRight leftSideHelp={missingFieldsLabel}>
        <Button
          behavior="button"
          onClick={onClick}
          disabled={disabled}
          disableWithoutIcon={!isFormBusy}
        >
          {secondsRemaining > 0
            ? `${t('send_test_email')} (${secondsRemaining}s)`
            : t('send_test_email')}
        </Button>
      </Element>

      {result?.status === 'success' && (
        <div className="px-5 sm:px-6 pb-4 space-y-2">
          <Alert type="success" disableClosing>
            <div className="flex flex-col">
              <span>{t('test_email_sent')}</span>

              {recipient && <span>{recipient}</span>}
            </div>
          </Alert>

          {result.wasDirty && (
            <Alert type="warning" disableClosing>
              {t('unsaved_changes')}
            </Alert>
          )}
        </div>
      )}

      {result?.status === 'failure' && (
        <div className="px-5 sm:px-6 pb-4">
          <Alert type="danger" disableClosing>
            <div className="flex items-center justify-between space-x-4">
              <span>{result.message || t('error_title')}</span>

              {isOAuthMailer(mailer) && (
                <Link to="/settings/user_details/connect">
                  {t('reconnect')}
                </Link>
              )}
            </div>
          </Alert>
        </div>
      )}
    </>
  );
}
