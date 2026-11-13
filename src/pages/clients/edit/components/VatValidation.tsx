import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { Button } from '$app/components/forms';

// EU member country IDs, matching the backend ClientObserver VAT eligibility.
const EU_COUNTRY_IDS = [
  40, 56, 100, 196, 203, 276, 208, 233, 724, 246, 250, 300, 191, 348, 372, 380,
  440, 442, 428, 470, 528, 616, 620, 642, 752, 705, 703,
];

export function VatValidation({
  client,
  requiresSave = false,
  onValidated,
}: {
  client: Client;
  requiresSave?: boolean;
  onValidated: (valid: boolean) => void;
}) {
  const [t] = useTranslation();
  const isEuClient = EU_COUNTRY_IDS.includes(Number(client.country_id));
  const needsSave = requiresSave || !client.id;
  const canCheck =
    isEuClient && !needsSave && Boolean(client.vat_number?.trim());
  const company = useCurrentCompany();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    'pending' | 'valid' | 'invalid' | 'unavailable' | 'timeout' | 'error'
  >();
  const pending = useRef<AbortController>();

  useEffect(() => {
    setResult(undefined);
    setBusy(false);
    return () => {
      pending.current?.abort();
      pending.current = undefined;
    };
  }, [
    requiresSave,
    company?.id,
    client.id,
    client.vat_number,
    client.shipping_country_id,
    client.country_id,
  ]);

  const check = async () => {
    if (pending.current || !canCheck) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setResult('pending');
    let interval: ReturnType<typeof setInterval> | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    controller.signal.addEventListener(
      'abort',
      () => {
        clearInterval(interval);
        clearTimeout(deadline);
      },
      { once: true }
    );

    const finish = (
      status: 'valid' | 'invalid' | 'unavailable' | 'timeout' | 'error'
    ) => {
      if (controller.signal.aborted || pending.current !== controller) return;
      controller.abort();
      pending.current = undefined;
      setBusy(false);
      setResult(status);
      if (status === 'valid' || status === 'invalid') {
        onValidated(status === 'valid');
      }
    };

    try {
      const response = await request(
        'POST',
        endpoint('/api/v1/clients/:id/check_vat', { id: client.id }),
        undefined,
        { skipIntercept: true, signal: controller.signal }
      );
      if (controller.signal.aborted) return;
      if (response.status !== 200) {
        finish('error');
        return;
      }

      // Keep a fixed deadline even if a status request stalls. Never overlap polls.
      deadline = setTimeout(() => finish('timeout'), 30_000);
      let polling = false;
      interval = setInterval(async () => {
        if (polling || controller.signal.aborted) return;
        polling = true;
        try {
          const response = await request(
            'GET',
            endpoint('/api/v1/clients/:id/vat_status', { id: client.id }),
            undefined,
            { skipIntercept: true, signal: controller.signal }
          );
          if (controller.signal.aborted) return;
          const status = response.data?.message;
          if (response.status !== 200) finish('error');
          else if (
            status === 'valid' ||
            status === 'invalid' ||
            status === 'unavailable'
          )
            finish(status);
          else if (status !== 'pending') finish('error');
        } catch {
          finish('error');
        } finally {
          polling = false;
        }
      }, 2_000);
    } catch {
      finish('error');
    }
  };

  if (!isEuClient) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        behavior="button"
        type="secondary"
        className="!px-2 !py-1 !text-xs shrink-0"
        onClick={check}
        disabled={busy || !canCheck}
        disableWithoutIcon={!canCheck}
      >
        {t('check_vat', { defaultValue: 'Check VAT' })}
      </Button>
      <span role="status" aria-live="polite">
        {needsSave &&
          t('save_client_before_vat_check', {
            defaultValue:
              'Save the client changes before checking the VAT number.',
          })}
        {result === 'pending' &&
          t('vat_validation_pending', { defaultValue: 'Checking VAT number…' })}
        {result === 'unavailable' &&
          t('vat_validation_unavailable', {
            defaultValue: 'VAT validation is unavailable. Please try again.',
          })}
        {result === 'timeout' &&
          t('vat_validation_timeout', {
            defaultValue: 'VAT validation timed out. Please try again.',
          })}
        {result === 'valid' &&
          t('vat_validation_valid', {
            defaultValue: 'VAT number is valid.',
          })}
        {result === 'invalid' &&
          t('vat_validation_invalid', {
            defaultValue: 'VAT number is invalid.',
          })}
        {result === 'error' &&
          t('vat_validation_failed', {
            defaultValue:
              'Unable to validate the VAT number. Please try again.',
          })}
      </span>
    </div>
  );
}
