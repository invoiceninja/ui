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
import { useTranslation } from 'react-i18next';
import { Spinner } from '$app/components/Spinner';
import { Button, InputField, InputLabel } from '$app/components/forms';
import { Footer, Legend, useTheme, radius } from '../kit';
import { Wizard } from '../useWizard';

interface Props {
  wizard: Wizard;
}

export function StepRecipient({ wizard }: Props) {
  const [translate] = useTranslation();
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
  const nameInput = useRef<HTMLInputElement>(null);
  const selected = wizard.client;

  useEffect(() => {
    const input = nameInput.current;

    if (!input) {
      return;
    }

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', String(matches.length > 0));
    input.setAttribute('aria-controls', 'iw-customer-suggestions');
    input.setAttribute('aria-autocomplete', 'list');

    if (active >= 0 && matches[active]) {
      input.setAttribute('aria-activedescendant', `iw-customer-${active}`);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }, [matches, active]);

  useEffect(() => {
    if (!matches.length) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!searchBox.current?.contains(event.target as Node)) {
        setMatches([]);
        setActive(-1);
        setDismissedSearch(true);
      }
    };

    document.addEventListener('mousedown', onPointerDown);

    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [matches.length]);

  useEffect(() => {
    if (selected || dismissedSearch || name.trim().length < 2) {
      setMatches([]);
      setSearching(false);
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    let cancelled = false;

    timer.current = setTimeout(() => {
      setSearching(true);

      request(
        'GET',
        endpoint(
          '/api/v1/clients?status=active&sort=display_name|asc&per_page=5&filter=:filter',
          { filter: encodeURIComponent(name.trim()) }
        ),
        {},
        { skipIntercept: true }
      )
        .then((response) => {
          if (cancelled) {
            return;
          }

          setMatches(response.data.data ?? []);
          setActive(-1);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          setMatches([]);
          setActive(-1);
        })
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

          <Button type="secondary" behavior="button" onClick={reset}>
            {translate('change')}
          </Button>
        </div>

        <Footer>
          <Button
            behavior="button"
            disableWithoutIcon
            onClick={continueForward}
          >
            {translate('continue')}
          </Button>
        </Footer>
      </div>
    );
  }

  return (
    <div className="iw-enter">
      <div className="space-y-4">
        <div
          className="relative"
          ref={searchBox}
          onKeyDown={(event) => {
            if (event.target !== nameInput.current || !matches.length) {
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
            } else if (event.key === 'Enter' && matches[active]) {
              event.preventDefault();
              choose(matches[active]);
            } else if (event.key === 'Escape') {
              setMatches([]);
              setActive(-1);
              setDismissedSearch(true);
            }
          }}
        >
          <InputLabel className="mb-1" for="iw-customer-name">
            Customer or company name
            <span className="ml-1 text-red-600">*</span>
          </InputLabel>

          <div className="flex items-start">
            <div className="flex-1 min-w-0">
              <InputField
                id="iw-customer-name"
                innerRef={nameInput}
                placeholder="Jane Smith"
                required
                value={name}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) => {
                  setName(value);
                  setDismissedSearch(false);
                  setActive(-1);
                }}
                errorMessage={errors.name}
              />
            </div>

            <span
              className="shrink-0 overflow-hidden flex items-center justify-end"
              style={{
                width: searching ? '1.875rem' : 0,
                height: '2.6875rem',
                transition: 'width 150ms ease',
              }}
              aria-hidden={!searching}
            >
              <Spinner />
            </span>
          </div>

          {matches.length > 0 ? (
            <div
              id="iw-customer-suggestions"
              role="listbox"
              className="absolute left-0 mt-1.5 z-20 border overflow-hidden"
              style={{
                right: searching ? '1.875rem' : 0,
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
        </div>

        <InputField
          id="iw-customer-email"
          label="Email address"
          type="email"
          placeholder="jane@example.com"
          value={email}
          changeOverride
          debounceTimeout={0}
          onValueChange={setEmail}
          errorMessage={errors.email}
        />

        {errors.general ? (
          <p className="text-xs" style={{ color: '#DC2626' }}>
            {errors.general}
          </p>
        ) : null}

        {showAddress ? (
          <div className="space-y-3">
            <Legend>Address</Legend>

            <InputField
              placeholder="Street address"
              value={address.address1}
              changeOverride
              debounceTimeout={0}
              onValueChange={(value) =>
                setAddress({ ...address, address1: value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <InputField
                placeholder="City"
                value={address.city}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) =>
                  setAddress({ ...address, city: value })
                }
              />
              <InputField
                placeholder="Postcode"
                value={address.postal_code}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) =>
                  setAddress({ ...address, postal_code: value })
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

      <Footer>
        <Button behavior="button" disabled={busy} onClick={continueForward}>
          {translate('continue')}
        </Button>
      </Footer>
    </div>
  );
}
