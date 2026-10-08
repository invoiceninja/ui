import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoint, isHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { Button } from '$app/components/forms';

export function PeppolDiscovery({
  client,
  requiresSave = false,
}: {
  client: Client;
  requiresSave?: boolean;
}) {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const enabled =
    // isHosted() &&
    Number(company?.legal_entity_id) > 0 &&
    company?.settings.e_invoice_type === 'PEPPOL';
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'found' | 'missing' | 'error'>();
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
    enabled,
    company?.legal_entity_id,
    company?.id,
    client.id,
    client.vat_number,
    client.id_number,
    client.routing_id,
    client.country_id,
    client.classification,
  ]);

  const check = async () => {
    if (pending.current || requiresSave || !enabled || !client.id) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setResult(undefined);
    try {
      const response = await request(
        'POST',
        endpoint('/api/v1/clients/:id/peppol_discovery', { id: client.id }),
        undefined,
        { skipIntercept: true, signal: controller.signal }
      );
      if (controller.signal.aborted) return;
      if (
        response.status !== 200 ||
        typeof response.data?.message !== 'boolean'
      ) {
        setResult('error');
      } else {
        setResult(response.data.message ? 'found' : 'missing');
      }
    } catch {
      if (!controller.signal.aborted) setResult('error');
    } finally {
      if (pending.current === controller) {
        pending.current = undefined;
        setBusy(false);
      }
    }
  };

  if (!enabled || !client.id) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        behavior="button"
        type="secondary"
        className="!px-2 !py-1 !text-xs shrink-0"
        onClick={check}
        disabled={busy || requiresSave}
        disableWithoutIcon={requiresSave}
      >
        {t('check_peppol_delivery', { defaultValue: 'Check PEPPOL delivery' })}
      </Button>
      <span role="status" aria-live="polite">
        {requiresSave &&
          t('save_client_before_discovery', {
            defaultValue:
              'Save the client changes before checking PEPPOL delivery.',
          })}
        {result === 'found' &&
          t('client_discoverable_on_peppol_network', {
            defaultValue: 'Client is discoverable on the PEPPOL network.',
          })}
        {result === 'missing' && t('client_not_found_on_peppol_network')}
        {result === 'error' &&
          t('peppol_discovery_failed', {
            defaultValue: 'Unable to check PEPPOL delivery. Please try again.',
          })}
      </span>
    </div>
  );
}
