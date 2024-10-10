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
import { Element } from '$app/components/cards';
import { CountrySelector } from '$app/components/CountrySelector';
import { Button, InputField, Link } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Step = 'plan_check' | 'buy_credits' | 'form' | 'completed';

export function Onboarding() {
  const accentColor = useAccentColor();
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<Step>('plan_check');

  useEffect(() => {
    if (step === 'completed') {
      setIsVisible(false);

      toast.success('Successfully configured PEPPOL');
    }
  }, [step]);

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
              <li className=" flex-1">
                <a
                  className="border-l-2 flex flex-col border-t-0 pl-4 pt-0 border-solid font-medium lg:pt-4 lg:border-t-2 lg:border-l-0 lg:pl-0"
                  style={{
                    borderColor: step === 'plan_check' ? accentColor : '',
                  }}
                >
                  <span
                    className="text-sm"
                    style={{ color: step === 'plan_check' ? accentColor : '' }}
                  >
                    {t('step')} 1
                  </span>
                  <h4 className="text-base lg:text-lg text-gray-900">
                    {t('plan')}
                  </h4>
                </a>
              </li>
              <li className=" flex-1">
                <a
                  className="border-l-2 flex flex-col border-t-0 pl-4 pt-0 border-solid font-medium lg:pt-4 lg:border-t-2 lg:border-l-0 lg:pl-0"
                  style={{
                    borderColor: step === 'buy_credits' ? accentColor : '',
                  }}
                >
                  <span
                    className="text-sm"
                    style={{ color: step === 'buy_credits' ? accentColor : '' }}
                  >
                    {t('step')} 2
                  </span>
                  <h4 className="text-base lg:text-lg text-gray-900">
                    {t('list_of_credits')}
                  </h4>
                </a>
              </li>
              <li className=" flex-1">
                <a
                  className="border-l-2 flex flex-col border-t-0 pl-4 pt-0 border-solid font-medium lg:pt-4 lg:border-t-2 lg:border-l-0 lg:pl-0"
                  style={{
                    borderColor: step === 'form' ? accentColor : '',
                  }}
                >
                  <span
                    className="text-sm"
                    style={{ color: step === 'form' ? accentColor : '' }}
                  >
                    {t('step')} 3
                  </span>
                  <h4 className="text-base lg:text-lg text-gray-900">
                    {t('details')}
                  </h4>
                </a>
              </li>
            </ol>

            {step === 'plan_check' && (
              <PlanCheck step={step} setStep={setStep} />
            )}

            {step === 'buy_credits' && (
              <BuyCredits step={step} setStep={setStep} />
            )}

            {step === 'form' && <Form step={step} setStep={setStep} />}
          </div>
        </div>
      </Modal>
    </>
  );
}

interface StepProps {
  step: Step;
  setStep: (step: Step) => void;
}

function PlanCheck({ setStep }: StepProps) {
  const isPaid = useIsPaid();
  const isWhitelabelled = useIsWhitelabelled();

  const { t } = useTranslation();

  useEffect(() => {
    if (isSelfHosted() && isWhitelabelled) {
      setStep('buy_credits');

      return;
    }

    if (isHosted() && isPaid) {
      setStep('buy_credits');

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
        <Button
          behavior="button"
          type="primary"
          onClick={() => setStep('buy_credits')}
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}

function BuyCredits({ setStep }: StepProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p>{t('peppol_credits_info')}</p>

      <Link to="https://invoiceninja.com" external>
        {t('buy_credits')}
      </Link>

      <div className="flex justify-end">
        <Button
          behavior="button"
          type="primary"
          onClick={() => setStep('form')}
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}

function Form({ setStep }: StepProps) {
  const { t } = useTranslation();
  const company = useCurrentCompany();
  const refresh = useRefreshCompanyUsers();

  const form = useFormik({
    initialValues: {
      party_name: company?.settings?.name || '',
      line1: company?.settings?.address1 || '',
      line2: company?.settings?.address2 || '',
      city: company?.settings?.city || '',
      county: company?.settings?.state || '',
      zip: company?.settings?.postal_code || '',
      country: company?.settings?.country_id || '',
    },
    onSubmit: (values) => {
      toast.processing();

      request('POST', endpoint('/api/v1/einvoice/peppol/setup'), values)
        .then(() => {
          toast.success('peppol_successfully_configured');

          setStep('completed');

          refresh();
        })
        .catch((e) => console.error(e));
    },
  });

  return (
    <div>
      <form onSubmit={form.handleSubmit} className="space-y-5">
        <InputField
          label={t('company_name')}
          value={form.values.party_name}
          onChange={form.handleChange}
          id="company_name"
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
        />

        <InputField
          value={form.values.line1}
          id="line1"
          label={t('address1')}
          onChange={form.handleChange}
        />

        <InputField
          value={form.values.line2}
          id="line2"
          label={t('address2')}
          onChange={form.handleChange}
        />

        <InputField
          value={form.values.city}
          id="city"
          label={t('city')}
          onChange={form.handleChange}
        />

        <InputField
          value={form.values.county}
          id="county"
          label={t('state')}
          onChange={form.handleChange}
        />

        <InputField
          value={form.values.zip}
          id="zip"
          label={t('postal_code')}
          onChange={form.handleChange}
        />

        <div className="flex justify-end">
          <Button type="primary">{t('continue')}</Button>
        </div>
      </form>
    </div>
  );
}
