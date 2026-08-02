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
import { compressImageFileForLogo } from '$app/common/helpers/logo-image';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField } from '$app/components/forms';
import { Callout, useTheme } from '../kit';

interface Props {
  focus: 'name' | 'logo' | null;
  onFocusHandled: () => void;
}

export function BrandPrompts({ focus, onFocusHandled }: Props) {
  const [translate] = useTranslation();
  const t = useTheme();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string>();

  const [uploading, setUploading] = useState(false);
  const [logoSkipped, setLogoSkipped] = useState(false);
  const [logoError, setLogoError] = useState<string>();

  const nameInput = useRef<HTMLInputElement>(null);
  const filePicker = useRef<HTMLInputElement>(null);

  const missingName = !company?.settings?.name;
  const missingLogo = !company?.settings?.company_logo;

  useEffect(() => {
    if (focus === null) {
      return;
    }

    if (focus === 'name' && missingName) {
      nameInput.current?.focus();
    }

    if (focus === 'logo' && missingLogo) {
      setLogoSkipped(false);
      filePicker.current?.click();
    }

    onFocusHandled();
  }, [focus, missingName, missingLogo, onFocusHandled]);

  async function saveName() {
    if (!company?.id) {
      return;
    }

    if (!name.trim()) {
      setNameError('Enter the name your customers know you by.');
      return;
    }

    setNameError(undefined);
    setSavingName(true);

    try {
      const response = await request(
        'PUT',
        endpoint('/api/v1/companies/:id', { id: company.id }),
        { ...company, settings: { ...company.settings, name: name.trim() } },
        { skipIntercept: true }
      );

      dispatch(updateRecord({ object: 'company', data: response.data.data }));
    } catch {
      setNameError("We couldn't save that. Try again.");
    } finally {
      setSavingName(false);
    }
  }

  async function uploadLogo(file: File) {
    if (!company?.id) {
      return;
    }

    setLogoError(undefined);
    setUploading(true);

    try {
      const prepared = await compressImageFileForLogo(file);

      const body = new FormData();
      body.append('company_logo', prepared);
      body.append('_method', 'PUT');

      const response = await request(
        'POST',
        endpoint('/api/v1/companies/:id', { id: company.id }),
        body,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          skipIntercept: true,
        }
      );

      dispatch(updateRecord({ object: 'company', data: response.data.data }));
    } catch {
      setLogoError("That image didn't upload. Try a PNG or JPG.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {missingName ? (
        <Callout title="Your invoice needs a business name.">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <InputField
                innerRef={nameInput}
                placeholder="Acme Studio"
                value={name}
                changeOverride
                debounceTimeout={0}
                onValueChange={setName}
                errorMessage={nameError}
              />
            </div>

            <Button behavior="button" disabled={savingName} onClick={saveName}>
              {translate('save')}
            </Button>
          </div>
        </Callout>
      ) : null}

      {!missingName && missingLogo && !logoSkipped ? (
        <Callout
          title="Add a logo to make this invoice look professional."
          onDismiss={() => setLogoSkipped(true)}
        >
          <div className="flex items-center gap-3">
            <Button
              type="secondary"
              behavior="button"
              disabled={uploading}
              onClick={() => filePicker.current?.click()}
            >
              Upload a logo
            </Button>

            <span className="text-xs" style={{ color: t.muted }}>
              PNG or JPG.
            </span>
          </div>

          {logoError ? (
            <p className="text-xs mt-2" style={{ color: '#DC2626' }}>
              {logoError}
            </p>
          ) : null}
        </Callout>
      ) : null}

      <input
        ref={filePicker}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void uploadLogo(file);
          }

          event.target.value = '';
        }}
      />
    </div>
  );
}
