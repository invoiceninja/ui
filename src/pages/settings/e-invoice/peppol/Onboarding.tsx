/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useIsWhitelabelled } from '$app/common/hooks/usePaidOrSelfhost';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Alert } from '$app/components/Alert';
import { Element } from '$app/components/cards';
import { CountrySelector } from '$app/components/CountrySelector';
import { Button, InputField, Link } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import { AxiosError } from 'axios';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';

export type Step =
  | 'plan_check'
  | 'token'
  | 'vat_check'
  | 'buy_credits'
  | 'form'
  | 'completed';

const translations: Record<Step, string> = {
  plan_check: 'plan',
  token: 'token',
  vat_check: 'vat',
  buy_credits: 'credits',
  form: 'form',
  completed: 'completed',
};

const defaultSteps: Step[] = [
  'plan_check',
  'token',
  'vat_check',
  'buy_credits',
  'form',
  'completed',
];

export function Onboarding() {
  const accentColor = useAccentColor();

  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<Step>('plan_check');
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [businessType, setBusinessType] = useState<'individual' | 'business'>();

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
  }, [steps]);

  const next = () => {
    const next = steps[steps.indexOf(step) + 1];

    if (next) {
      setStep(next);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setStep('plan_check');
    }
  }, [isVisible]);

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
                .filter((s) => !['token', 'completed'].includes(s))
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
                        {t(translations[s])}
                      </h4>
                    </a>
                  </li>
                ))}
            </ol>

            {step === 'plan_check' ? (
              <PlanCheck step={step} onContinue={next} />
            ) : null}

            {step === 'token' ? <Token step={step} onContinue={next} /> : null}

            {step === 'vat_check' ? (
              <VatCheck
                businessType={businessType}
                setBusinessType={setBusinessType}
                onContinue={next}
                step={step}
              />
            ) : null}

            {step === 'buy_credits' ? (
              <BuyCredits step={step} onContinue={next} />
            ) : null}

            {step === 'form' ? (
              <Form
                step={step}
                onContinue={next}
                businessType={businessType!}
              />
            ) : null}
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
  const account = useCurrentAccount();
  const isWhitelabelled = useIsWhitelabelled();
  const accentColor = useAccentColor();

  const [hasValidLicense, setHasValidLicense] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (isHosted() && account?.plan === 'enterprise') {
      onContinue();

      return;
    }
  }, [account?.plan, isWhitelabelled]);

  const form = useFormik({
    initialValues: {},
    onSubmit(_, { setSubmitting }) {
      if (import.meta.env.DEV) {
        setHasValidLicense(true);

        onContinue();

        return;
      }

      request('POST', endpoint('/api/v1/check_license'))
        .then(() => {
          setHasValidLicense(true);

          onContinue();
        })
        .catch((e: AxiosError<ValidationBag>) => {
          if (e.response?.status === 422) {
            toast.error(e.response.data.message);

            return;
          }

          console.error(e);

          toast.error(t('invalid_white_label_license')!);
        })
        .finally(() => setSubmitting(false));
    },
  });

  const buyWhitelabelUrl =
    import.meta.env.VITE_WHITELABEL_INVOICE_URL ||
    'https://invoiceninja.invoicing.co/client/subscriptions/O5xe7Rwd7r/purchase';

  return (
    <div className="space-y-5">
      <p className="text-lg">{isSelfHosted() ? t('license') : t('plan')}</p>

      {isSelfHosted() ? (
        <div>
          {t('peppol_whitelabel_warning')} <br /> <br />
          {t('add_license_to_env')}
          &nbsp;
          <a
            href="https://invoiceninja.github.io/en/env-variables/"
            target="_blank"
            rel="noreferrer"
            style={{ color: accentColor }}
          >
            {t('learn_more')}
          </a>
          <form
            className="mt-4"
            id="checkLicenseForm"
            onSubmit={form.handleSubmit}
          ></form>
          {!isWhitelabelled ? (
            <div className="mt-2">
              <Link to={buyWhitelabelUrl} external>
                {t('purchase_license')}
              </Link>
            </div>
          ) : null}
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
        {hasValidLicense ? (
          <Button behavior="button" type="primary" onClick={() => onContinue()}>
            {t('continue')}
          </Button>
        ) : (
          <Button
            form="checkLicenseForm"
            type="primary"
            onClick={form.submitForm}
            disabled={form.isSubmitting}
          >
            {t('verify')}
          </Button>
        )}
      </div>
    </div>
  );
}

function Token({ onContinue }: StepProps) {
  const generate = () => {
    request('POST', endpoint(`/api/v1/einvoice/token/update`))
      .then(() => {
        onContinue();
      })
      .catch(() => toast.error());
  };

  useEffect(() => {
    generate();
  }, []);

  return <Spinner />;
}

function BuyCredits({ onContinue }: StepProps) {
  const { t } = useTranslation();
  const colors = useColorScheme();

  return (
    <div>
      <p className="text-lg">{t('credits')}</p>
      <p>{t('peppol_credits_info')}</p>

      <div className="my-3 space-y-2">
        <a
          href="https://invoiceninja.invoicing.co/client/subscriptions/WJxboqNegw/purchase"
          target="_blank"
          rel="noreferrer"
          className="rounded w-full p-3 text-left border flex justify-between items-center hover:underline"
          style={{
            backgroundColor: colors.$1,
          }}
        >
          {t('buy')} (PEPPOL 500)
        </a>

        <a
          href="https://invoiceninja.invoicing.co/client/subscriptions/k8mep0reMy/purchase"
          target="_blank"
          rel="noreferrer"
          className="rounded w-full p-3 text-left border flex justify-between items-center hover:underline"
          style={{
            backgroundColor: colors.$1,
          }}
        >
          {t('buy')} (PEPPOL 1000)
        </a>
      </div>

      <div className="flex justify-end">
        <Button behavior="button" type="primary" onClick={() => onContinue()}>
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}

type FormProps = StepProps & {
  businessType: 'individual' | 'business';
};

function Form({ onContinue, businessType }: FormProps) {
  const { t } = useTranslation();
  const company = useCurrentCompany();
  const refresh = useRefreshCompanyUsers();
  const account = useCurrentAccount();

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
      vat_number: company?.settings?.vat_number || '',
      id_number: company?.settings.id_number || '',
    },
    onSubmit: (values, { setSubmitting }) => {
      toast.processing();

      setErrors(null);

      request('POST', endpoint('/api/v1/einvoice/peppol/setup'), {
        ...values,
        tenant_id: company?.company_key,
        e_invoicing_token: account?.e_invoicing_token,
        classification: businessType,
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
      <p className="text-lg">{t('details')}</p>
      <p>{t('details_update_info')}</p>

      <div className="my-4">
        {errors ? <Alert type="danger">{errors.message ?? get(errors, 'errors.0.details')}</Alert> : null}
      </div>

      <form onSubmit={form.handleSubmit} className="space-y-5">
        <InputField
          label={t('company_name')}
          value={form.values.party_name}
          onChange={form.handleChange}
          id="party_name"
          errorMessage={get(errors, 'errors.party_name')}
        />

        {businessType === 'business' ? (
          <InputField
            value={form.values.vat_number}
            onChange={form.handleChange}
            label={t('vat_number')}
            id="vat_number"
            errorMessage={get(errors, 'errors.vat_number')}
          />
        ) : null}

        {businessType === 'individual' ? (
          <InputField
            value={form.values.id_number}
            onChange={form.handleChange}
            label={t('id_number')}
            id="id_number"
            errorMessage={get(errors, 'errors.id_number')}
          />
        ) : null}

        <CountrySelector
          value={form.values.country}
          label={t('country')}
          onChange={(e) => form.setFieldValue('country', e)}
          errorMessage={get(errors, 'errors.country')}
        />

        <InputField
          value={form.values.line1}
          id="line1"
          label={t('address1')}
          onChange={form.handleChange}
          errorMessage={get(errors, 'errors.line1')}
        />

        <InputField
          value={form.values.line2}
          id="line2"
          label={t('address2')}
          onChange={form.handleChange}
          errorMessage={get(errors, 'errors.line2')}
        />

        <InputField
          value={form.values.city}
          id="city"
          label={t('city')}
          onChange={form.handleChange}
          errorMessage={get(errors, 'errors.city')}
        />

        <InputField
          value={form.values.county}
          id="county"
          label={t('state')}
          onChange={form.handleChange}
          errorMessage={get(errors, 'errors.county')}
        />

        <InputField
          value={form.values.zip}
          id="zip"
          label={t('postal_code')}
          onChange={form.handleChange}
          errorMessage={get(errors, 'errors.zip')}
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

type VatCheckProps = StepProps & {
  businessType: 'business' | 'individual' | undefined;
  setBusinessType: (businessType: 'business' | 'individual') => void;
};

function VatCheck({
  businessType,
  setBusinessType,
  onContinue,
}: VatCheckProps) {
  const { t } = useTranslation();

  const accentColor = useAccentColor();
  const colors = useColorScheme();

  return (
    <div>
      <p className="text-lg">Are you registered for VAT?</p>

      <div className="my-5 space-y-2">
        <button
          className="rounded w-full p-3 text-left border flex justify-between items-center"
          style={{
            backgroundColor: colors.$1,
            borderColor: businessType === 'business' ? accentColor : colors.$5,
          }}
          onClick={() => setBusinessType('business')}
        >
          <p>Yes, I have a VAT number</p>

          <Check
            size={18}
            color={accentColor}
            className={classNames({
              hidden: businessType !== 'business',
            })}
          />
        </button>

        <button
          className="rounded w-full p-3 text-left border flex justify-between items-center"
          style={{
            backgroundColor: colors.$1,
            borderColor:
              businessType === 'individual' ? accentColor : colors.$5,
          }}
          onClick={() => setBusinessType('individual')}
        >
          <p>No, I am an individual</p>

          <Check
            size={18}
            color={accentColor}
            className={classNames({
              hidden: businessType !== 'individual',
            })}
          />
        </button>
      </div>

      <div className="flex justify-end">
        <Button
          behavior="button"
          type="primary"
          disabled={!businessType}
          disableWithoutIcon
          onClick={() => onContinue()}
        >
          {t('Continue')}
        </Button>
      </div>
    </div>
  );
}

export function Disconnect() {
  const accentColor = useAccentColor();
  const refresh = useRefreshCompanyUsers();
  const company = useCurrentCompany();
  const account = useCurrentAccount();

  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  const disconnect = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/einvoice/peppol/disconnect'), {
      company_key: company.company_key,
      legal_entity_id: company.legal_entity_id,
      tax_data: company.tax_data,
      e_invoicing_token: account?.e_invoicing_token,
    })
      .then(() => {
        toast.success('disconnected');
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

        <div className="flex justify-end mt-5">
          <Button behavior="button" type="primary" onClick={disconnect}>
            {t('continue')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
