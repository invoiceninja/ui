/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import {
  useIsPaid,
  useIsWhitelabelled,
} from '$app/common/hooks/usePaidOrSelfhost';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { CountrySelector } from '$app/components/CountrySelector';
import { Button, InputField, Link } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Modal } from '$app/components/Modal';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Step =
  | 'plan_check'
  | 'token'
  | 'buy_credits'
  | 'form'
  | 'completed';

export function Onboarding() {
  const accentColor = useAccentColor();
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  const [step, setStep] = useState<Step>('plan_check');
  const [steps, setSteps] = useState<Step[]>([
    'plan_check',
    'token',
    'buy_credits',
    'form',
    'completed',
  ]);

  useEffect(() => {
    if (step === 'completed') {
      setIsVisible(false);

      toast.success(t('peppol_successfully_configured')!);
    }
  }, [step]);

  useEffect(() => {
    if (isHosted()) {
      setSteps((c) => c.filter((s) => s !== 'token'));
    }
  }, []);

  const next = () => {
    const next = steps[steps.indexOf(step) + 1];

    if (next) {
      setStep(next);
    }
  };

  return (
    <>
      <Element>
        <div className="space-x-1">
          <span>{t('peppol_onboarding')}</span>
          <button
            style={{ color: accentColor }}
            type="button"
            onClick={() => {
              setStep('plan_check');
              setIsVisible(true);
            }}
          >
            {t('get_started')}
          </button>
        </div>
      </Element>

      <Modal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        title={t('configure_peppol')}
        size="regular"
      >
        <div className="">
          <div className="max-w-xl mx-auto space-y-10">
            <ol className="lg:flex items-center w-full space-y-4 lg:space-x-8 lg:space-y-0">
              {steps
                .filter((s) => s !== 'completed')
                .map((s, i) => (
                  <li className="flex-1" key={i}>
                    <a
                      className="border-l-2 flex flex-col border-t-0 pl-4 pt-0 border-solid font-medium lg:pt-4 lg:border-t-2 lg:border-l-0 lg:pl-0"
                      style={{
                        borderColor: step === s ? accentColor : '',
                      }}
                    >
                      <span
                        className="text-sm"
                        style={{
                          color: step === s ? accentColor : '',
                        }}
                      >
                        {t('step')} {i + 1}
                      </span>
                      <h4 className="text-base lg:text-lg text-gray-900">
                        {t(s)}
                      </h4>
                    </a>
                  </li>
                ))}
            </ol>

            {step === 'plan_check' && (
              <PlanCheck step={step} onContinue={next} />
            )}

            {step === 'token' && <Token step={step} onContinue={next} />}

            {step === 'buy_credits' && (
              <BuyCredits step={step} onContinue={next} />
            )}

            {step === 'form' && <Form step={step} onContinue={next} />}
          </div>
        </div>
      </Modal>
    </>
  );
}

interface StepProps {
  step: Step;
  onContinue: () => void;
}

function PlanCheck({ onContinue }: StepProps) {
  const isPaid = useIsPaid();
  const isWhitelabelled = useIsWhitelabelled();

  const { t } = useTranslation();

  useEffect(() => {
    if (isSelfHosted() && isWhitelabelled) {
      onContinue();

      return;
    }

    if (isHosted() && isPaid) {
      onContinue();

      return;
    }
  }, [isPaid, isWhitelabelled]);

  return (
    <div className="space-y-5">
      {isSelfHosted() ? (
        <div>
          {t('peppol_whitelabel_warning')} <br />
          <Link to="/settings/account_management">{t('purchase_license')}</Link>
        </div>
      ) : null}

      {isHosted() ? (
        <div>
          {t('peppol_plan_warning')} <br />
          <Link to="/settings/account_management">
            {t('pro_plan_call_to_action')}
          </Link>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button behavior="button" type="primary" onClick={() => onContinue()}>
          {t('continue')} (in dev)
        </Button>
      </div>
    </div>
  );
}

function Token({ onContinue }: StepProps) {
  const { t } = useTranslation();

  const accentColor = useAccentColor();
  const company = useCurrentCompany();

  const [isTokenGenerated, setIsTokenGenerated] = useState(false);

  const generate = () => {
    toast.processing();

    request('POST', endpoint('/api/einvoice/tokens/rotate'), {
      company_key: company.company_key,
    })
      .then(() => {
        toast.success('peppol_token_generated');

        setIsTokenGenerated(true);
      })
      .catch(() => {
        toast.error();
      });
  };

  return (
    <div>
      <p>{t('peppol_tokens_info')}</p>
      <p className="mt-2">
        Token is used as another step to make sure invoices are sent securely.
        Unlike white-label licenses, token can be rotated at any point without
        need to wait on Invoice Ninja support.
      </p>

      <div className="flex items-center gap-1 my-3">
        <p>You need to generate a token to continue.</p>
        <button type="button" style={{ color: accentColor }} onClick={generate}>
          Generate token
        </button>
      </div>

      <div className="flex justify-end">
        {isTokenGenerated ? (
          <Button behavior="button" type="primary" onClick={() => onContinue()}>
            {t('continue')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function BuyCredits({ onContinue }: StepProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p>{t('peppol_credits_info')}</p>

      <Link to="https://invoiceninja.com" external>
        {t('buy_credits')}
      </Link>

      <div className="flex justify-end">
        <Button behavior="button" type="primary" onClick={() => onContinue()}>
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}

function Form({ onContinue }: StepProps) {
  const { t } = useTranslation();
  const company = useCurrentCompany();
  const refresh = useRefreshCompanyUsers();

  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const form = useFormik({
    initialValues: {
      party_name: company?.settings?.name || '',
      line1: company?.settings?.address1 || '',
      line2: company?.settings?.address2 || '',
      city: company?.settings?.city || '',
      county: company?.settings?.state || '',
      zip: company?.settings?.postal_code || '',
      country: company?.settings?.country_id || '',
      acts_as_sender: true,
      acts_as_receiver: true,
    },
    onSubmit: (values, { setSubmitting }) => {
      toast.processing();

      setErrors(null);

      const onboardingUrl = isSelfHosted()
        ? import.meta.env.VITE_HOSTED_PEPPOL_ONBOARDING_URL
        : endpoint('/api/v1/einvoice/peppol/setup');

      request('POST', onboardingUrl, {
        ...values,
        tenant_id: company?.company_key,
      })
        .then(() => {
          toast.success('peppol_successfully_configured');

          onContinue();

          refresh();
        })
        .catch((e: AxiosError<ValidationBag>) => {
          console.error(e);

          if (e.response?.status === 422) {
            setErrors(e.response.data);

            toast.dismiss();

            return;
          }

          toast.error();
        })
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <div>
      <form onSubmit={form.handleSubmit} className="space-y-5">
        <InputField
          label={t('company_name')}
          value={form.values.party_name}
          onChange={form.handleChange}
          id="party_name"
          errorMessage={errors?.errors.party_name}
        />

        <InputField
          value={company?.settings.vat_number || ''}
          label={t('vat_number')}
          disabled
        />

        <CountrySelector
          value={form.values.country}
          label={t('country')}
          onChange={(e) => form.setFieldValue('country', e)}
          errorMessage={errors?.errors.country}
        />

        <InputField
          value={form.values.line1}
          id="line1"
          label={t('address1')}
          onChange={form.handleChange}
          errorMessage={errors?.errors.line1}
        />

        <InputField
          value={form.values.line2}
          id="line2"
          label={t('address2')}
          onChange={form.handleChange}
          errorMessage={errors?.errors.line2}
        />

        <InputField
          value={form.values.city}
          id="city"
          label={t('city')}
          onChange={form.handleChange}
          errorMessage={errors?.errors.city}
        />

        <InputField
          value={form.values.county}
          id="county"
          label={t('state')}
          onChange={form.handleChange}
          errorMessage={errors?.errors.county}
        />

        <InputField
          value={form.values.zip}
          id="zip"
          label={t('postal_code')}
          onChange={form.handleChange}
          errorMessage={errors?.errors.zip}
        />

        <Toggle
          checked={form.values.acts_as_sender}
          label={t('acts_as_sender')}
          id="acts_as_sender"
          onChange={(v) => form.setFieldValue('acts_as_sender', v)}
        />

        <Toggle
          checked={form.values.acts_as_receiver}
          label={t('acts_as_receiver')}
          id="acts_as_receiver"
          onChange={(v) => form.setFieldValue('acts_as_receiver', v)}
        />

        <div className="flex justify-end">
          <Button type="primary" disabled={form.isSubmitting}>
            {t('continue')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function Disconnect() {
  const accentColor = useAccentColor();
  const refresh = useRefreshCompanyUsers();

  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  const disconnect = () => {
    toast.processing();

    const disconnectUrl = isSelfHosted()
      ? import.meta.env.VITE_HOSTED_PEPPOL_DISCONNECT_URL
      : endpoint('/api/v1/einvoice/peppol/disconnect');

    request('POST', disconnectUrl)
      .then(() => {
        toast.success('peppol_successfully_disconnected');
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => {
        setIsVisible(false);

        refresh();
      });
  };

  return (
    <>
      <button
        type="button"
        style={{ color: accentColor }}
        onClick={() => setIsVisible(true)}
      >
        {t('disconnect')}
      </button>

      <Modal
        title={t('peppol_disconnect')}
        visible={isVisible}
        onClose={() => setIsVisible(false)}
      >
        {t('peppol_disconnect_long')}

        <div className="flex justify-end">
          <Button behavior="button" type="primary" onClick={disconnect}>
            {t('Continue')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
