/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, trans } from '$app/common/helpers';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '$app/components/Spinner';
import { Modal } from '$app/components/Modal';
import { Button, InputField, InputLabel } from '$app/components/forms';
import { ErrorBanner } from './ErrorBanner';
import { StepFooter } from './StepFooter';
import { Legend } from './Legend';
import { StepTransition } from './StepTransition';
import { Wizard } from '../useWizard';

interface Props {
  wizard: Wizard;
}

export function StepRecipient({ wizard }: Props) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const [t] = useTranslation();

  const [name, setName] = useState('');
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
    general?: string;
  }>({});
  const [active, setActive] = useState(-1);
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [savingContact, setSavingContact] = useState(false);
  const [contactErrors, setContactErrors] = useState<{
    email?: string;
    general?: string;
  }>({});

  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lastMatches = useRef<Client[]>([]);
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

          const found = (response.data.data ?? []) as Client[];

          lastMatches.current = found;
          setMatches(found);
          setActive(-1);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          lastMatches.current = [];
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

  const choose = (client: Client) => {
    wizard.attachClient(client);
    setMatches([]);
    setActive(-1);
    setErrors({});
  };

  const reset = () => {
    wizard.detachClient();
    setName('');
    setDismissedSearch(false);
    setErrors({});
  };

  const applyServerErrors = (caught: AxiosError<ValidationBag>) => {
    const bag = caught.response?.data?.errors;

    if (!bag) {
      setErrors({ general: t('customer_not_saved') });

      return;
    }

    const next: { name?: string; general?: string } = {};

    Object.entries(bag).forEach(([key, messages]) => {
      const message = messages[0];

      if (key === 'name') {
        next.name = message;
      } else {
        next.general = message;
      }
    });

    setErrors(next);
  };

  const createClient = (): Promise<Client | null> => {
    if (!name.trim()) {
      setErrors({ name: t('field_is_required') });

      return Promise.resolve(null);
    }

    setErrors({});
    wizard.clearErrors();
    setBusy(true);

    return request(
      'POST',
      endpoint('/api/v1/clients'),
      {
        name: name.trim(),
        address1: address.address1,
        city: address.city,
        postal_code: address.postal_code,
      },
      { skipIntercept: true }
    )
      .then((response) => {
        const created = response.data.data as Client;

        choose(created);
        $refetch(['clients']);

        return created;
      })
      .catch((caught: AxiosError<ValidationBag>) => {
        applyServerErrors(caught);

        return null;
      })
      .finally(() => setBusy(false));
  };

  const openContact = () => {
    const existing = selected?.contacts?.[0];

    setContact({
      first_name: existing?.first_name ?? '',
      last_name: existing?.last_name ?? '',
      email: existing?.email ?? '',
    });
    setContactErrors({});
    setContactOpen(true);
  };

  const saveContact = () => {
    if (!selected?.id) {
      return;
    }

    const email = contact.email.trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setContactErrors({ email: t('provide_email') });

      return;
    }

    setContactErrors({});
    setSavingContact(true);

    const contacts = (selected.contacts ?? []).length
      ? selected.contacts.map((entry, index) =>
          index === 0
            ? {
                ...entry,
                first_name: contact.first_name.trim(),
                last_name: contact.last_name.trim(),
                email,
                send_email: true,
              }
            : entry
        )
      : [
          {
            first_name: contact.first_name.trim(),
            last_name: contact.last_name.trim(),
            email,
            send_email: true,
          },
        ];

    request(
      'PUT',
      endpoint('/api/v1/clients/:id', { id: selected.id }),
      { ...selected, contacts, documents: [] },
      { skipIntercept: true }
    )
      .then((response) => {
        const saved = response.data.data as Client;

        wizard.attachClient(saved);
        $refetch(['clients']);
        setContactOpen(false);
      })
      .catch((caught: AxiosError<ValidationBag>) => {
        const bag = caught.response?.data?.errors;
        const emailError = bag?.['contacts.0.email']?.[0];

        setContactErrors(
          emailError
            ? { email: emailError }
            : { general: t('email_address_not_saved') }
        );
      })
      .finally(() => setSavingContact(false));
  };

  const proceed = () => {
    setBusy(true);

    return wizard.flush().then((saved) => {
      setBusy(false);

      if (saved) {
        wizard.next();
      }
    });
  };

  const continueForward = () => {
    setErrors({});

    if (selected) {
      return proceed();
    }

    if (!name.trim()) {
      setErrors({ name: t('field_is_required') });

      return;
    }

    const typed = name.trim().toLowerCase();
    const collides = lastMatches.current.some((match) => {
      return (
        (match.display_name || match.name || '').trim().toLowerCase() === typed
      );
    });

    if (collides) {
      setErrors({ name: t('please_select_a_client') });
      setDismissedSearch(false);

      return;
    }

    return createClient().then((created) => {
      if (created) {
        return proceed();
      }
    });
  };

  if (selected) {
    return (
      <StepTransition>
        <ErrorBanner errors={wizard.errors} />

        <div
          className="flex items-start justify-between gap-4 border px-4 py-3.5"
          style={{ borderColor: colors.$24, borderRadius: '0.375rem' }}
        >
          <div className="min-w-0">
            <p
              className="text-sm"
              style={{ color: colors.$3, fontWeight: 500 }}
            >
              {selected.display_name || selected.name}
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-xs" style={{ color: colors.$17 }}>
                {selected.contacts?.[0]?.email || t('client_email_not_set')}
              </span>

              {selected.contacts?.[0]?.email ? null : (
                <Button type="minimal" behavior="button" onClick={openContact}>
                  {t('edit_client')}
                </Button>
              )}
            </div>
          </div>

          <Button type="secondary" behavior="button" onClick={reset}>
            {t('change')}
          </Button>
        </div>

        {wizard.errors?.errors?.client_id ? (
          <p className="text-xs mt-2 text-red-600">
            {wizard.errors.errors.client_id[0]}
          </p>
        ) : null}

        <StepFooter>
          <Button behavior="button" disabled={busy} onClick={continueForward}>
            {t('continue')}
          </Button>
        </StepFooter>

        <ContactModal
          open={contactOpen}
          contact={contact}
          errors={contactErrors}
          busy={savingContact}
          onChange={setContact}
          onClose={() => setContactOpen(false)}
          onSave={saveContact}
        />
      </StepTransition>
    );
  }

  const serverErrors = wizard.errors?.errors;

  return (
    <StepTransition>
      <ErrorBanner errors={wizard.errors} />

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
            {t('client_name')}
            <span className="ml-1 text-red-600">*</span>
          </InputLabel>

          <div className="flex items-start">
            <div className="flex-1 min-w-0">
              <InputField
                id="iw-customer-name"
                innerRef={nameInput}
                placeholder={t('name')}
                required
                value={name}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) => {
                  setName(value);
                  setDismissedSearch(false);
                  setActive(-1);
                  setErrors({});
                  wizard.clearErrors();
                }}
                errorMessage={errors.name ?? serverErrors?.client_id?.[0]}
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
                backgroundColor: colors.$1,
                borderColor: colors.$24,
                borderRadius: '0.375rem',
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
                    color: colors.$3,
                    backgroundColor:
                      active === index ? colors.$25 : 'transparent',
                  }}
                  onMouseEnter={() => setActive(index)}
                >
                  <span className="text-sm truncate">
                    {match.display_name || match.name}
                  </span>
                  <span
                    className="text-xs shrink-0"
                    style={{ color: colors.$17 }}
                  >
                    {match.contacts?.[0]?.email}
                  </span>
                </button>
              ))}

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setMatches([]);
                  setActive(-1);
                  setDismissedSearch(true);

                  void createClient();
                }}
                className="w-full text-left px-3.5 py-2.5 border-t text-xs"
                style={{
                  borderColor: colors.$20,
                  color: colors.$17,
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                {trans('add_value_as_new_client', { value: name.trim() })}
              </button>
            </div>
          ) : null}
        </div>

        {errors.general ? (
          <p className="text-xs text-red-600">{errors.general}</p>
        ) : null}

        {showAddress ? (
          <div className="space-y-3">
            <Legend>{t('address')}</Legend>

            <InputField
              id="iw-customer-address1"
              label={t('address1')}
              value={address.address1}
              changeOverride
              debounceTimeout={0}
              onValueChange={(value) =>
                setAddress({ ...address, address1: value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <InputField
                id="iw-customer-city"
                label={t('city')}
                value={address.city}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) =>
                  setAddress({ ...address, city: value })
                }
              />
              <InputField
                id="iw-customer-postcode"
                label={t('postal_code')}
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
            style={{ color: accentColor, fontWeight: 500 }}
          >
            {t('billing_address')}
          </button>
        )}
      </div>

      <StepFooter>
        <Button behavior="button" disabled={busy} onClick={continueForward}>
          {t('continue')}
        </Button>
      </StepFooter>
    </StepTransition>
  );
}

function ContactModal({
  open,
  contact,
  errors,
  busy,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  contact: { first_name: string; last_name: string; email: string };
  errors: { email?: string; general?: string };
  busy: boolean;
  onChange: (next: {
    first_name: string;
    last_name: string;
    email: string;
  }) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [t] = useTranslation();

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title={t('edit_client')}
      size="small"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="iw-contact-first-name"
            label={t('first_name')}
            value={contact.first_name}
            changeOverride
            debounceTimeout={0}
            onValueChange={(value) =>
              onChange({ ...contact, first_name: value })
            }
          />

          <InputField
            id="iw-contact-last-name"
            label={t('last_name')}
            value={contact.last_name}
            changeOverride
            debounceTimeout={0}
            onValueChange={(value) =>
              onChange({ ...contact, last_name: value })
            }
          />
        </div>

        <InputField
          id="iw-contact-email"
          type="email"
          required
          label={t('email_address')}
          value={contact.email}
          changeOverride
          debounceTimeout={0}
          onValueChange={(value) => onChange({ ...contact, email: value })}
          errorMessage={errors.email}
        />

        {errors.general ? (
          <p className="text-xs text-red-600">{errors.general}</p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="secondary" behavior="button" onClick={onClose}>
            {t('cancel')}
          </Button>

          <Button
            behavior="button"
            disabled={busy}
            disableWithoutIcon={!busy}
            onClick={onSave}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
