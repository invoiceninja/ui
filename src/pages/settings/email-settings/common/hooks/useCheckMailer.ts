/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useShouldUpdateCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { MailerCheckResponse } from '$app/common/interfaces/mailer-check';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
  BOUND_MAILER_CHECK_FIELDS,
  buildMailerCheckDraft,
  toMailerCheckRequest,
} from '../helpers/mailer-check';

const DEFAULT_COOLDOWN_SECONDS = 60;

const MAXIMUM_COOLDOWN_SECONDS = 300;

export interface MailerCheckResult {
  mailer: string;
  status: 'success' | 'failure';
  message: string;
  wasDirty: boolean;
}

interface MailerCheckErrors {
  mailer: string;
  bag: ValidationBag;
}

const resolveCooldownSeconds = (error: AxiosError) => {
  const retryAfter = Number(error.response?.headers?.['retry-after']);

  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter, MAXIMUM_COOLDOWN_SECONDS);
  }

  return DEFAULT_COOLDOWN_SECONDS;
};

const getUnboundErrorMessages = (bag: ValidationBag) => {
  return Object.entries(bag.errors || {})
    .filter(([field]) => !BOUND_MAILER_CHECK_FIELDS.includes(field))
    .flatMap(([, messages]) => messages);
};

export function useCheckMailer() {
  const user = useCurrentUser();
  const company = useCompanyChanges();

  const shouldUpdate = useShouldUpdateCompany();

  const { isAdmin, isOwner } = useAdmin();
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errors, setErrors] = useState<MailerCheckErrors>();
  const [result, setResult] = useState<MailerCheckResult>();
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const isMounted = useRef<boolean>(true);

  const mailer = company?.settings.email_sending_method;
  const draft = buildMailerCheckDraft(company, user?.email);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setErrors(undefined);
    setResult(undefined);
  }, [mailer]);

  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((cooldownUntil - Date.now()) / 1000)
      );

      setSecondsRemaining(remaining);

      if (remaining === 0) {
        setCooldownUntil(0);
      }
    };

    tick();

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const handleCheckMailer = () => {
    if (
      isFormBusy ||
      secondsRemaining > 0 ||
      !draft ||
      draft.missingFields.length
    ) {
      return;
    }

    const { url, body } = toMailerCheckRequest(draft.payload);

    const requestedMailer = draft.payload.mailer;
    const wasDirty = shouldUpdate();

    setIsFormBusy(true);
    setErrors(undefined);
    setResult(undefined);

    toast.processing();

    request('POST', endpoint(url), body, { skipIntercept: true })
      .then((response: AxiosResponse<MailerCheckResponse>) => {
        toast.success('test_email_sent');

        if (isMounted.current) {
          setResult({
            mailer: requestedMailer,
            status: 'success',
            message: response.data?.message || '',
            wasDirty,
          });
        }
      })
      .catch((error: AxiosError<ValidationBag>) => {
        const status = error.response?.status;

        if (status === 422 && error.response) {
          const bag = error.response.data;
          const hasFieldErrors = Boolean(
            bag.errors && Object.keys(bag.errors).length
          );
          const alertMessage = hasFieldErrors
            ? getUnboundErrorMessages(bag).join(' ')
            : bag.message;

          if (isMounted.current) {
            if (hasFieldErrors) {
              setErrors({ mailer: requestedMailer, bag });
            }

            if (alertMessage) {
              setResult({
                mailer: requestedMailer,
                status: 'failure',
                message: alertMessage,
                wasDirty: false,
              });
            }
          }

          toast.dismiss();

          return;
        }

        if (status === 429) {
          if (isMounted.current) {
            setCooldownUntil(Date.now() + resolveCooldownSeconds(error) * 1000);
          }

          toast.error('too_many_requests');

          return;
        }

        if (status === 403) {
          if (isMounted.current) {
            setIsForbidden(true);
          }

          toast.error('unauthorized_action');

          return;
        }

        if (error.code === 'ERR_NETWORK') {
          toast.error('server_not_reachable');

          return;
        }

        const message =
          status && status < 500 ? error.response?.data?.message : undefined;

        if (isMounted.current) {
          setResult({
            mailer: requestedMailer,
            status: 'failure',
            message: message || '',
            wasDirty: false,
          });
        }

        toast.error(message || 'error_title');
      })
      .finally(() => {
        if (isMounted.current) {
          setIsFormBusy(false);
        }
      });
  };

  return {
    handleCheckMailer,
    isFormBusy,
    isAvailable: Boolean(
      draft && isCompanySettingsActive && (isAdmin || isOwner) && !isForbidden
    ),
    missingFields: draft?.missingFields ?? [],
    secondsRemaining,
    errors: errors && errors.mailer === mailer ? errors.bag : undefined,
    result:
      result && result.mailer === mailer
        ? { ...result, wasDirty: result.wasDirty && shouldUpdate() }
        : undefined,
    recipient: user?.email,
  };
}
