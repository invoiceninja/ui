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
import { Button, InputField } from '$app/components/forms';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useTheme } from '../kit';

export function BrandPrompts() {
  const [translate] = useTranslation();
  const t = useTheme();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string>();

  const [uploading, setUploading] = useState(false);
  const [logoError, setLogoError] = useState<string>();

  const filePicker = useRef<HTMLInputElement>(null);

  const businessName: string = company?.settings?.name ?? '';
  const hasLogo = Boolean(company?.settings?.company_logo);

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
      {businessName ? null : (
        <div>
          <p
            className="text-sm mb-2"
            style={{ color: t.text, fontWeight: 500 }}
          >
            Your invoice needs a business name.
          </p>

          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <InputField
                id="iw-business-name"
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
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: t.muted }}>
          {hasLogo ? 'Logo added' : 'No logo'}
        </p>

        <Button
          type="secondary"
          behavior="button"
          disabled={uploading}
          onClick={() => filePicker.current?.click()}
        >
          {hasLogo ? translate('change') : 'Add a logo'}
        </Button>
      </div>

      {logoError ? (
        <p className="text-xs" style={{ color: '#DC2626' }}>
          {logoError}
        </p>
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
