/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankInvitation } from '$app/common/constants/blank-invitation';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { endpoint } from '$app/common/helpers';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { request } from '$app/common/helpers/request';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Client } from '$app/common/interfaces/client';
import { Company } from '$app/common/interfaces/company.interface';
import { Currency } from '$app/common/interfaces/currency';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { Invitation } from '$app/common/interfaces/purchase-order';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { TAG_ENTITY_TYPES } from '$app/common/interfaces/tag';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { toast } from '$app/common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { startDate, today } from '../helpers/dates';
import { firstErrorMessage } from '../helpers/first-error';
import { cloneDeep } from 'lodash';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export type StepKey = 'who' | 'what' | 'schedule' | 'when' | 'notes' | 'send';

export const STEPS: { key: StepKey; title: string; href: string }[] = [
  { key: 'who', title: 'client_details', href: '/recurring_invoices/guided' },
  {
    key: 'what',
    title: 'what_are_you_charging_for',
    href: '/recurring_invoices/guided/items',
  },
  {
    key: 'schedule',
    title: 'frequency_id',
    href: '/recurring_invoices/guided/schedule',
  },
  {
    key: 'when',
    title: 'payment_terms',
    href: '/recurring_invoices/guided/payment',
  },
  {
    key: 'notes',
    title: 'terms',
    href: '/recurring_invoices/guided/notes',
  },
  {
    key: 'send',
    title: 'review_and_start',
    href: '/recurring_invoices/guided/send',
  },
];

const SERVER_OWNED: (keyof RecurringInvoice)[] = [
  'id',
  'number',
  'status_id',
  'updated_at',
  'created_at',
  'user_id',
  'is_deleted',
];

const adoptServerOwned = (
  target: RecurringInvoice,
  source: RecurringInvoice
): RecurringInvoice => {
  return SERVER_OWNED.reduce((merged, key) => {
    return { ...merged, [key]: source[key] };
  }, target);
};

export interface Wizard {
  ready: boolean;
  loadFailed: boolean;
  retryLoad: () => void;

  recurringInvoice: RecurringInvoice | undefined;
  recurringInvoiceId: string | null;
  client: Client | undefined;
  step: StepKey;
  stepIndex: number;
  errors: ValidationBag | undefined;
  clearErrors: () => void;
  dismissed: (key: string) => boolean;
  dismiss: (key: string) => void;
  totals: Totals;
  currency: Currency | undefined;

  goTo: (step: StepKey) => void;
  next: () => void;
  back: () => void;

  patch: (changes: Partial<RecurringInvoice>) => void;
  setLineItems: (items: InvoiceItem[]) => void;
  attachClient: (client: Client) => void;
  detachClient: () => void;
  refreshClient: (client: Client) => void;

  flush: (options?: FlushOptions) => Promise<RecurringInvoice | null>;
}

export interface FlushOptions {
  start?: boolean;
}

export interface WizardContext {
  wizard: Wizard;
}

export interface TaxRow {
  name: string;
  total: number;
}

export interface Totals {
  subtotal: number;
  total: number;
  discount: number;
  taxRows: TaxRow[];
  surchargeRows: TaxRow[];
}

const EMPTY_TOTALS: Totals = {
  subtotal: 0,
  total: 0,
  discount: 0,
  taxRows: [],
  surchargeRows: [],
};

const SURCHARGES: {
  field: keyof Pick<
    RecurringInvoice,
    | 'custom_surcharge1'
    | 'custom_surcharge2'
    | 'custom_surcharge3'
    | 'custom_surcharge4'
  >;
  label: keyof Company['custom_fields'];
}[] = [
  { field: 'custom_surcharge1', label: 'surcharge1' },
  { field: 'custom_surcharge2', label: 'surcharge2' },
  { field: 'custom_surcharge3', label: 'surcharge3' },
  { field: 'custom_surcharge4', label: 'surcharge4' },
];

const ERROR_STEPS: { prefix: string; step: StepKey }[] = [
  { prefix: 'client_id', step: 'who' },
  { prefix: 'invitations', step: 'who' },
  { prefix: 'line_items', step: 'what' },
  { prefix: 'frequency_id', step: 'schedule' },
  { prefix: 'next_send_date', step: 'schedule' },
  { prefix: 'remaining_cycles', step: 'schedule' },
  { prefix: 'due_date_days', step: 'when' },
  { prefix: 'auto_bill', step: 'when' },
  { prefix: 'auto_bill_enabled', step: 'when' },
  { prefix: 'terms', step: 'notes' },
];

const ownsKey = (prefix: string, key: string): boolean => {
  return key === prefix || key.startsWith(`${prefix}.`);
};

const errorStep = (bag: ValidationBag): StepKey | undefined => {
  const keys = Object.keys(bag.errors ?? {});

  return ERROR_STEPS.find((entry) => {
    return keys.some((key) => ownsKey(entry.prefix, key));
  })?.step;
};

const HANDOFF_ACTIONS = ['clone'];

const RECURRING_TAG_TYPES: string[] = [
  TAG_ENTITY_TYPES.recurringInvoice,
  TAG_ENTITY_TYPES.global,
];

const withRows = (items: InvoiceItem[]): InvoiceItem[] => {
  return items.length
    ? items
    : [{ ...blankLineItem(), quantity: 1, sort_id: 0 }];
};

export function useWizard(existingId?: string): Wizard {
  const company = useCurrentCompany();
  const resolveCurrency = useResolveCurrency();

  const [recurringInvoice, setRecurringInvoice] = useState<RecurringInvoice>();
  const [recurringInvoiceId, setRecurringInvoiceId] = useState<string | null>(
    null
  );
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [client, setClient] = useState<Client>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [handoff, setHandoff] = useAtom(recurringInvoiceAtom);
  const handoffOnEntry = useRef(handoff);

  const step: StepKey =
    STEPS.find((entry) => entry.href === location.pathname)?.key ?? 'who';
  const [errors, setErrors] = useState<ValidationBag>();
  const [dismissals, setDismissals] = useState<Record<string, boolean>>({});

  const latest = useRef<RecurringInvoice>();
  const persistedId = useRef<string | null>(null);
  useEffect(() => {
    let cancelled = false;

    setLoadFailed(false);

    const action = searchParams.get('action') ?? '';
    const clientParam = searchParams.get('client') ?? '';

    const adoptClient = (id: string) => {
      return request(
        'GET',
        endpoint('/api/v1/clients/:id', { id }),
        {},
        { skipIntercept: true }
      )
        .then((response) => {
          if (cancelled) {
            return;
          }

          const adopted = response.data.data as Client | undefined;

          if (adopted?.id) {
            attachClient(adopted);
            navigate(STEPS[1].href, { replace: true });

            return;
          }

          detachClient();
        })
        .catch(() => !cancelled && detachClient());
    };

    const handedOff =
      !existingId && HANDOFF_ACTIONS.includes(action)
        ? handoffOnEntry.current
        : undefined;

    if (handedOff) {
      const adopted = cloneDeep(handedOff);

      if (typeof adopted.line_items === 'string') {
        adopted.line_items = [];
      }

      const seeded = {
        ...adopted,
        next_send_date: startDate(adopted.next_send_date),
        remaining_cycles:
          adopted.remaining_cycles === 0 ? -1 : adopted.remaining_cycles,
        tags: (adopted.tags ?? []).filter((tag) =>
          RECURRING_TAG_TYPES.includes(tag.entity_type)
        ),
        line_items: withRows(adopted.line_items),
      };

      latest.current = seeded;
      setRecurringInvoice(seeded);
      setHandoff(undefined);

      if (seeded.client_id) {
        void adoptClient(seeded.client_id);
      }

      return () => {
        cancelled = true;
      };
    }

    const url = existingId
      ? endpoint('/api/v1/recurring_invoices/:id?include=client', {
          id: existingId,
        })
      : endpoint('/api/v1/recurring_invoices/create');

    request('GET', url, {}, { skipIntercept: true })
      .then((response) => {
        if (cancelled) {
          return;
        }

        const loaded = response.data.data as RecurringInvoice;

        if (typeof loaded.line_items === 'string') {
          loaded.line_items = [];
        }

        if (existingId) {
          persistedId.current = loaded.id;
          setRecurringInvoiceId(loaded.id);

          if (loaded.client) {
            setClient(loaded.client);
          }

          latest.current = loaded;
          setRecurringInvoice(loaded);

          return;
        }

        const seeded = {
          ...loaded,
          next_send_date: loaded.next_send_date || today(),
          uses_inclusive_taxes: Boolean(company?.settings?.inclusive_taxes),
          line_items: [{ ...blankLineItem(), quantity: 1, sort_id: 0 }],
        };

        latest.current = seeded;
        setRecurringInvoice(seeded);

        if (clientParam) {
          void adoptClient(clientParam);
        }
      })
      .catch(() => !cancelled && setLoadFailed(true));

    return () => {
      cancelled = true;
    };
  }, [loadAttempt, existingId]);

  const retryLoad = useCallback(() => setLoadAttempt((n) => n + 1), []);

  const patch = useCallback((changes: Partial<RecurringInvoice>) => {
    if (latest.current) {
      latest.current = { ...latest.current, ...changes };
    }

    setRecurringInvoice((previous) =>
      previous ? { ...previous, ...changes } : previous
    );
  }, []);

  const setLineItems = useCallback(
    (items: InvoiceItem[]) => {
      patch({
        line_items: items.map((item, index) => ({ ...item, sort_id: index })),
      });
    },
    [patch]
  );

  const flush = useCallback(
    (options?: FlushOptions): Promise<RecurringInvoice | null> => {
      const current = latest.current;

      if (!current) {
        return Promise.resolve(null);
      }

      const id = persistedId.current;
      const query = options?.start ? '?start=true' : '';

      return (
        id
          ? request(
              'PUT',
              endpoint(`/api/v1/recurring_invoices/:id${query}`, { id }),
              current,
              { skipIntercept: true }
            )
          : request(
              'POST',
              endpoint(`/api/v1/recurring_invoices${query}`),
              current,
              { skipIntercept: true }
            )
      )
        .then((response) => {
          const saved = response.data.data as RecurringInvoice;

          setErrors(undefined);

          persistedId.current = saved.id;
          setRecurringInvoiceId(saved.id);

          latest.current = latest.current
            ? adoptServerOwned(latest.current, saved)
            : latest.current;
          setRecurringInvoice((previous) =>
            previous ? adoptServerOwned(previous, saved) : previous
          );

          if (!id) {
            $refetch(['recurring_invoices']);
          }

          return saved;
        })
        .catch((caught: AxiosError<ValidationBag>) => {
          if (caught.response?.status !== 422) {
            toast.error();

            return null;
          }

          const bag = caught.response.data;

          const stray = firstErrorMessage(
            bag,
            Object.keys(bag.errors ?? {}).filter((key) => {
              return ERROR_STEPS.some((entry) => ownsKey(entry.prefix, key));
            })
          );

          if (stray) {
            toast.error(stray);
          }

          setErrors(bag);

          const owner = errorStep(bag);
          const target = STEPS.find((entry) => entry.key === owner);

          if (!existingId && target && target.href !== location.pathname) {
            navigate(target.href);
          }

          return null;
        });
    },
    [navigate, location.pathname, existingId]
  );

  const attachClient = useCallback(
    (next: Client) => {
      const changed =
        !persistedId.current && latest.current?.client_id !== next.id;

      setClient(next);
      setErrors(undefined);

      const emailable = (next.contacts ?? []).filter(
        (contact) => contact.send_email !== false
      );

      const contacts = emailable.length
        ? emailable
        : (next.contacts ?? []).slice(0, 1);

      patch({
        client_id: next.id,
        invitations: contacts.map((contact) => {
          return {
            ...(cloneDeep(blankInvitation) as unknown as Invitation),
            client_contact_id: contact.id,
          };
        }),
        ...(changed ? { auto_bill: '', project_id: '', location_id: '' } : {}),
      });
    },
    [patch]
  );

  const detachClient = useCallback(() => {
    setClient(undefined);
    setErrors(undefined);
    patch({ client_id: '', invitations: [] });

    if (location.pathname !== STEPS[0].href) {
      navigate(STEPS[0].href);
    }
  }, [patch, navigate, location.pathname]);

  const refreshClient = useCallback((next: Client) => setClient(next), []);

  const currency = resolveCurrency(
    client?.settings?.currency_id || company?.settings?.currency_id
  );

  const totals = useMemo<Totals>(() => {
    if (!recurringInvoice || !currency) {
      return EMPTY_TOTALS;
    }

    const scratch = cloneDeep(recurringInvoice);

    const sum = recurringInvoice.uses_inclusive_taxes
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

    const taxRows = [
      ...sum.getTotalTaxMap().all(),
      ...sum.getTaxMap().all(),
    ].map((entry) => ({ name: entry.name, total: entry.total }));

    const surchargeRows = SURCHARGES.map((surcharge) => {
      return {
        name: String(company?.custom_fields?.[surcharge.label] ?? '').split(
          '|'
        )[0],
        total: Number(recurringInvoice[surcharge.field] ?? 0),
      };
    }).filter((row) => {
      return row.total !== 0;
    });

    return {
      subtotal: sum.getSubTotal(),
      discount: sum.getTotalDiscount(),
      total: sum.getTotal(),
      taxRows,
      surchargeRows,
    };
  }, [
    recurringInvoice,
    currency,
    company?.settings?.e_invoice_type,
    company?.custom_fields,
  ]);

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
    ready: Boolean(recurringInvoice),
    loadFailed,
    retryLoad,
    recurringInvoice,
    recurringInvoiceId,
    client,
    step,
    stepIndex,
    errors,
    clearErrors: () => setErrors(undefined),
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
