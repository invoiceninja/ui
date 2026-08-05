/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankLineItem } from '$app/common/constants/blank-line-item';
import { endpoint } from '$app/common/helpers';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { request } from '$app/common/helpers/request';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Client } from '$app/common/interfaces/client';
import { Currency } from '$app/common/interfaces/currency';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type StepKey = 'who' | 'what' | 'when' | 'send';

export const STEPS: { key: StepKey; title: string; href: string }[] = [
  { key: 'who', title: 'Who are you invoicing?', href: '/invoices/wizard' },
  {
    key: 'what',
    title: 'What are you charging for?',
    href: '/invoices/wizard/items',
  },
  {
    key: 'when',
    title: 'When should they pay?',
    href: '/invoices/wizard/payment',
  },
  { key: 'send', title: 'Review and send', href: '/invoices/wizard/send' },
];

export type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

const SERVER_OWNED = [
  'id',
  'number',
  'status_id',
  'updated_at',
  'created_at',
  'user_id',
  'is_deleted',
] as const;

export function today(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function addDays(from: string, days: number): string {
  return dayjs(from || today())
    .add(days, 'day')
    .format('YYYY-MM-DD');
}

export interface Wizard {
  ready: boolean;
  loadFailed: boolean;
  retryLoad: () => void;

  invoice: Invoice | undefined;
  invoiceId: string | null;
  client: Client | undefined;
  step: StepKey;
  stepIndex: number;
  saveState: SaveState;
  sent: boolean;
  sentTo: string;
  markSent: (address: string) => void;
  dismissed: (key: string) => boolean;
  dismiss: (key: string) => void;
  totals: Totals;
  currency: Currency | undefined;

  goTo: (step: StepKey) => void;
  next: () => void;
  back: () => void;

  patch: (changes: Partial<Invoice>) => void;
  setLineItems: (items: InvoiceItem[]) => void;
  attachClient: (client: Client) => void;
  detachClient: () => void;
  refreshClient: (client: Client) => void;

  flush: () => Promise<string | null>;
}

export interface WizardContext {
  wizard: Wizard;
  money: (value: number) => string;
}

export interface Totals {
  subtotal: number;
  taxes: number;
  total: number;
  discount: number;
}

const EMPTY_TOTALS: Totals = { subtotal: 0, taxes: 0, total: 0, discount: 0 };

export function useWizard(): Wizard {
  const company = useCurrentCompany();
  const resolveCurrency = useResolveCurrency();

  const [invoice, setInvoice] = useState<Invoice>();
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [client, setClient] = useState<Client>();
  const location = useLocation();
  const navigate = useNavigate();

  const step: StepKey =
    STEPS.find((entry) => entry.href === location.pathname)?.key ?? 'who';
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [dismissals, setDismissals] = useState<Record<string, boolean>>({});

  const latest = useRef<Invoice>();
  const persistedId = useRef<string | null>(null);
  const pending = useRef<Promise<string | null> | null>(null);
  const revision = useRef(0);
  const written = useRef(0);
  const createFailed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const alive = useRef(true);

  const flushOnLeave = useRef<() => void>(() => undefined);

  useEffect(() => {
    alive.current = true;

    return () => {
      alive.current = false;

      if (timer.current) {
        clearTimeout(timer.current);
      }

      flushOnLeave.current();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoadFailed(false);

    request(
      'GET',
      endpoint('/api/v1/invoices/create'),
      {},
      { skipIntercept: true }
    )
      .then((response) => {
        if (cancelled) {
          return;
        }

        const blank = response.data.data as Invoice;

        if (typeof blank.line_items === 'string') {
          blank.line_items = [];
        }

        const seeded = {
          ...blank,
          date: blank.date || today(),
          uses_inclusive_taxes: Boolean(company?.settings?.inclusive_taxes),
          line_items: [{ ...blankLineItem(), quantity: 1, sort_id: 0 }],
        };

        latest.current = seeded;
        setInvoice(seeded);
      })
      .catch(() => !cancelled && setLoadFailed(true));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAttempt]);

  const retryLoad = useCallback(() => setLoadAttempt((n) => n + 1), []);

  const write = useCallback(async (): Promise<string | null> => {
    const current = latest.current;

    const at = revision.current;

    if (!current || !current.client_id) {
      written.current = at;

      return null;
    }

    const id = persistedId.current;

    if (!id && createFailed.current) {
      written.current = at;

      return null;
    }

    setSaveState('saving');

    const payload = cloneDeep(current) as Invoice & { paymentables?: unknown };
    delete payload.paymentables;

    try {
      const response = id
        ? await request(
            'PUT',
            endpoint('/api/v1/invoices/:id', { id }),
            payload,
            {
              skipIntercept: true,
            }
          )
        : await request('POST', endpoint('/api/v1/invoices'), payload, {
            skipIntercept: true,
          });

      const saved = response.data.data as Invoice;
      const created = !id;

      persistedId.current = saved.id;
      createFailed.current = false;
      written.current = at;

      if (!alive.current) {
        return saved.id;
      }

      setInvoiceId(saved.id);

      const merge = (previous: Invoice | undefined) => {
        if (!previous) {
          return previous;
        }

        const merged = { ...previous };

        SERVER_OWNED.forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (merged as any)[key] = (saved as any)[key];
        });

        return merged;
      };

      latest.current = merge(latest.current);
      setInvoice(merge);
      setSaveState('saved');

      if (created) {
        $refetch(['invoices']);
      }

      return saved.id;
    } catch {
      if (!id) {
        createFailed.current = true;
      }

      if (alive.current) {
        setSaveState('failed');
      }

      return null;
    }
  }, []);

  const save = useCallback((): Promise<string | null> => {
    const outstanding = () => revision.current !== written.current;

    if (pending.current) {
      return pending.current.then(() =>
        outstanding() ? save() : persistedId.current
      );
    }

    const run = write().finally(() => {
      pending.current = null;
    });

    pending.current = run;

    return run.then((id) => (outstanding() && id ? save() : id));
  }, [write]);

  const schedule = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => void save(), 900);
  }, [save]);

  const patch = useCallback(
    (changes: Partial<Invoice>) => {
      if (latest.current) {
        latest.current = { ...latest.current, ...changes };
      }

      revision.current += 1;

      setInvoice((previous) =>
        previous ? { ...previous, ...changes } : previous
      );

      schedule();
    },
    [schedule]
  );

  const setLineItems = useCallback(
    (items: InvoiceItem[]) => {
      patch({
        line_items: items.map((item, index) => ({ ...item, sort_id: index })),
      });
    },
    [patch]
  );

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    createFailed.current = false;

    return save();
  }, [save]);

  flushOnLeave.current = () => {
    if (revision.current !== written.current) {
      void save();
    }
  };

  const attachClient = useCallback(
    (next: Client) => {
      setClient(next);

      const emailable = (next.contacts ?? []).filter(
        (contact) => contact.send_email !== false
      );

      const contacts = emailable.length
        ? emailable
        : (next.contacts ?? []).slice(0, 1);

      patch({
        client_id: next.id,
        invitations: contacts.map((contact) => ({
          client_contact_id: contact.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as any,
      });
    },
    [patch]
  );

  const detachClient = useCallback(() => {
    setClient(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch({ client_id: '', invitations: [] as any });

    if (location.pathname !== STEPS[0].href) {
      navigate(STEPS[0].href);
    }
  }, [patch, navigate, location.pathname]);

  const refreshClient = useCallback((next: Client) => setClient(next), []);

  const currency = resolveCurrency(
    client?.settings?.currency_id || company?.settings?.currency_id
  );

  const totals = useMemo<Totals>(() => {
    if (!invoice || !currency) {
      return EMPTY_TOTALS;
    }

    const scratch = cloneDeep(invoice);

    const sum = invoice.uses_inclusive_taxes
      ? new InvoiceSumInclusive(
          scratch,
          currency,
          company?.settings?.e_invoice_type
        ).build()
      : new InvoiceSum(
          scratch,
          currency,
          company?.settings?.e_invoice_type
        ).build();

    return {
      subtotal: sum.getSubTotal(),
      taxes: sum.getTotalTaxes(),
      discount: sum.getTotalDiscount(),
      total: sum.getTotal(),
    };
  }, [invoice, currency, company?.settings?.e_invoice_type]);

  const stepIndex = STEPS.findIndex((entry) => entry.key === step);

  const goTo = useCallback(
    (next: StepKey) => {
      const target = STEPS.find((entry) => entry.key === next);

      if (!target) {
        return;
      }

      navigate(target.href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [navigate]
  );

  const next = useCallback(() => {
    const target = STEPS[Math.min(stepIndex + 1, STEPS.length - 1)];
    goTo(target.key);
  }, [stepIndex, goTo]);

  const back = useCallback(() => {
    const target = STEPS[Math.max(stepIndex - 1, 0)];
    goTo(target.key);
  }, [stepIndex, goTo]);

  return {
    ready: Boolean(invoice),
    loadFailed,
    retryLoad,
    invoice,
    invoiceId,
    client,
    step,
    stepIndex,
    saveState,
    sent,
    sentTo,
    markSent: (address: string) => {
      if (!latest.current?.client_id) {
        return;
      }

      setSentTo(address);
      setSent(true);
    },
    dismissed: (key: string) => Boolean(dismissals[key]),
    dismiss: (key: string) =>
      setDismissals((current) => ({ ...current, [key]: true })),
    totals,
    currency,
    goTo,
    next,
    back,
    patch,
    setLineItems,
    attachClient,
    detachClient,
    refreshClient,
    flush,
  };
}
