/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { useEffect, useRef, useState } from 'react';
import {
  Action,
  Hint,
  Legend,
  Question,
  TextField,
  useTheme,
  radius,
} from '../kit';
import { Wizard } from '../useWizard';

interface Props {
  wizard: Wizard;
}

export function StepRecipient({ wizard }: Props) {
  const t = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState({
    address1: '',
    city: '',
    postal_code: '',
  });

  const [matches, setMatches] = useState<Client[]>([]);
  const [searching, setSearching] = useState(false);
  const [dismissedSearch, setDismissedSearch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    general?: string;
  }>({});
  const [active, setActive] = useState(-1);

  const timer = useRef<ReturnType<typeof setTimeout>>();
  const searchBox = useRef<HTMLDivElement>(null);
  const selected = wizard.client;

  useEffect(() => {
    if (!matches.length) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!searchBox.current?.contains(event.target as Node)) {
        setMatches([]);
      }
    };

    document.addEventListener('mousedown', onPointerDown);

    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [matches.length]);

  useEffect(() => {
    if (selected || dismissedSearch || name.trim().length < 2) {
      setMatches([]);
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    setSearching(true);

    let cancelled = false;

    timer.current = setTimeout(() => {
      request(
        'GET',
        endpoint(
          '/api/v1/clients?status=active&sort=display_name|asc&per_page=5&filter=:filter',
          { filter: encodeURIComponent(name.trim()) }
        ),
        {},
        { skipIntercept: true }
      )
        .then((response) => !cancelled && setMatches(response.data.data ?? []))
        .catch(() => !cancelled && setMatches([]))
        .finally(() => !cancelled && setSearching(false));
    }, 300);

    return () => {
      cancelled = true;

      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [name, selected, dismissedSearch]);

  function choose(client: Client) {
    wizard.attachClient(client);
    setMatches([]);
    setActive(-1);
    setErrors({});
  }

  function reset() {
    wizard.detachClient();
    setName('');
    setEmail('');
    setDismissedSearch(false);
    setErrors({});
  }

  async function continueForward() {
    setErrors({});

    if (selected) {
      wizard.next();
      return;
    }

    if (!name.trim()) {
      setErrors({ name: 'Enter who this invoice is for.' });
      return;
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrors({ email: "That doesn't look like an email address." });
      return;
    }

    setBusy(true);

    try {
      const response = await request(
        'POST',
        endpoint('/api/v1/clients'),
        {
          name: name.trim(),
          address1: address.address1,
          city: address.city,
          postal_code: address.postal_code,
          contacts: [
            {
              first_name: name.trim(),
              last_name: '',
              email: email.trim(),
              send_email: true,
            },
          ],
        },
        { skipIntercept: true }
      );

      choose(response.data.data as Client);

      $refetch(['clients']);

      wizard.next();
    } catch (caught) {
      const bag = (
        caught as {
          response?: { data?: { errors?: Record<string, string[]> } };
        }
      ).response?.data?.errors;

      if (!bag) {
        setErrors({ general: "We couldn't save this customer. Try again." });
      } else {
        const next: { name?: string; email?: string; general?: string } = {};

        Object.entries(bag).forEach(([key, messages]) => {
          const message = messages[0];

          if (key === 'name') {
            next.name = message;
          } else if (key.includes('email')) {
            next.email = message;
          } else {
            next.general = message;
          }
        });

        setErrors(next);
      }
    } finally {
      setBusy(false);
    }
  }

  if (selected) {
    return (
      <div className="iw-enter">
        <Question lede="This invoice is addressed to them. You can change it any time before you send.">
          Who are you invoicing?
        </Question>

        <div
          className="flex items-start justify-between gap-4 border px-4 py-3.5"
          style={{ borderColor: t.line, borderRadius: radius.panel }}
        >
          <div className="min-w-0">
            <p className="text-sm" style={{ color: t.text, fontWeight: 500 }}>
              {selected.display_name || selected.name}
            </p>

            <p className="text-xs mt-0.5" style={{ color: t.muted }}>
              {selected.contacts?.[0]?.email || 'No email address yet'}
            </p>
          </div>

          <Action tone="ghost" onClick={reset}>
            Change
          </Action>
        </div>

        <div className="mt-8">
          <Action tone="solid" onClick={continueForward}>
            Continue
          </Action>
        </div>
      </div>
    );
  }

  return (
    <div className="iw-enter">
      <Question lede="Start typing — we'll look for anyone you've invoiced before.">
        Who are you invoicing?
      </Question>

      <div className="space-y-4">
        <div className="relative" ref={searchBox}>
          <TextField
            label="Customer or company name"
            placeholder="Jane Smith, or Acme Studio"
            value={name}
            autoFocus
            autoComplete="off"
            role="combobox"
            aria-expanded={matches.length > 0}
            aria-controls="iw-customer-suggestions"
            aria-activedescendant={
              active >= 0 ? `iw-customer-${active}` : undefined
            }
            onChange={(event) => {
              setName(event.target.value);
              setDismissedSearch(false);
              setActive(-1);
            }}
            onKeyDown={(event) => {
              if (!matches.length) {
                return;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((current) => (current + 1) % matches.length);
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((current) =>
                  current <= 0 ? matches.length - 1 : current - 1
                );
              } else if (event.key === 'Enter' && active >= 0) {
                event.preventDefault();
                choose(matches[active]);
              } else if (event.key === 'Escape') {
                setMatches([]);
                setActive(-1);
              }
            }}
            error={errors.name}
          />

          {matches.length > 0 ? (
            <div
              id="iw-customer-suggestions"
              role="listbox"
              className="absolute left-0 right-0 mt-1.5 z-20 border overflow-hidden"
              style={{
                backgroundColor: t.surface,
                borderColor: t.line,
                borderRadius: radius.control,
                boxShadow: '0 12px 32px -12px rgba(9,9,11,0.28)',
              }}
            >
              {matches.map((match, index) => (
                <button
                  key={match.id}
                  id={`iw-customer-${index}`}
                  role="option"
                  aria-selected={active === index}
                  type="button"
                  onClick={() => choose(match)}
                  className="w-full text-left px-3.5 py-2.5 flex items-baseline justify-between gap-3"
                  style={{
                    color: t.text,
                    backgroundColor: active === index ? t.hover : 'transparent',
                  }}
                  onMouseEnter={() => setActive(index)}
                >
                  <span className="text-sm truncate">
                    {match.display_name || match.name}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: t.muted }}>
                    {match.contacts?.[0]?.email}
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setDismissedSearch(true)}
                className="w-full text-left px-3.5 py-2.5 border-t text-xs"
                style={{ borderColor: t.hairline, color: t.muted }}
              >
                None of these — add “{name.trim()}” as a new customer
              </button>
            </div>
          ) : null}

          {searching && matches.length === 0 && name.trim().length >= 2 ? (
            <Hint>Looking…</Hint>
          ) : null}
        </div>

        <TextField
          label="Email address"
          type="email"
          placeholder="jane@example.com"
          value={email}
          autoComplete="off"
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          hint="We'll send the invoice here. You can add it later."
        />

        {errors.general ? (
          <p className="text-xs" style={{ color: '#DC2626' }}>
            {errors.general}
          </p>
        ) : null}

        {showAddress ? (
          <div className="space-y-3">
            <Legend>Address</Legend>

            <TextField
              placeholder="Street address"
              value={address.address1}
              onChange={(event) =>
                setAddress({ ...address, address1: event.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <TextField
                placeholder="City"
                value={address.city}
                onChange={(event) =>
                  setAddress({ ...address, city: event.target.value })
                }
              />
              <TextField
                placeholder="Postcode"
                value={address.postal_code}
                onChange={(event) =>
                  setAddress({ ...address, postal_code: event.target.value })
                }
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddress(true)}
            className="text-sm"
            style={{ color: t.accent, fontWeight: 500 }}
          >
            Add an address
          </button>
        )}
      </div>

      <div className="mt-8">
        <Action tone="solid" busy={busy} onClick={continueForward}>
          Continue
        </Action>
      </div>
    </div>
  );
}
