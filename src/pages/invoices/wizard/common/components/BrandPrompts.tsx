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
import { useColorScheme } from '$app/common/colors';
import { compressImageFileForLogo } from '$app/common/helpers/logo-image';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Button, InputField } from '$app/components/forms';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  section?: 'name' | 'brand';
  logoSkipped: boolean;
  onSkipLogo: () => void;
}

export function BrandPrompts({ section, logoSkipped, onSkipLogo }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [errors, setErrors] = useState<ValidationBag>();

  const filePicker = useRef<HTMLInputElement>(null);

  const businessName: string = company?.settings?.name ?? '';
  const hasLogo = Boolean(company?.settings?.company_logo);

  const showName = section !== 'brand' && !businessName;
  const showBrand = section !== 'name' && (hasLogo || !logoSkipped);

  const saveName = () => {
    if (!company?.id) {
      return;
    }

    setErrors(undefined);
    setSavingName(true);

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company.id }),
      { ...company, settings: { ...company.settings, name: name.trim() } },
      { skipIntercept: true }
    )
      .then((response) =>
        dispatch(updateRecord({ object: 'company', data: response.data.data }))
      )
      .catch((caught: AxiosError<ValidationBag>) => {
        if (caught.response?.status === 422) {
          setErrors(caught.response.data);
        } else {
          toast.error();
        }
      })
      .finally(() => setSavingName(false));
  };

  const uploadLogo = (file: File) => {
    if (!company?.id) {
      return;
    }

    setErrors(undefined);
    setUploading(true);

    compressImageFileForLogo(file)
      .then((prepared) => {
        const body = new FormData();
        body.append('company_logo', prepared);
        body.append('_method', 'PUT');

        return request(
          'POST',
          endpoint('/api/v1/companies/:id', { id: company.id }),
          body,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            skipIntercept: true,
          }
        );
      })
      .then((response) => {
        setLogoFailed(false);

        return dispatch(
          updateRecord({ object: 'company', data: response.data.data })
        );
      })
      .catch((caught: AxiosError<ValidationBag>) => {
        if (caught.response?.status === 422) {
          setErrors(caught.response.data);
        } else {
          toast.error();
        }
      })
      .finally(() => setUploading(false));
  };

  if (!showName && !showBrand) {
    return null;
  }

  return (
    <div className="space-y-3">
      {showName ? (
        <div>
          <p
            className="text-sm mb-2"
            style={{ color: colors.$3, fontWeight: 500 }}
          >
            {t('invoice_needs_business_name')}
          </p>

          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <InputField
                id="iw-business-name"
                placeholder={t('company_name')}
                value={name}
                changeOverride
                debounceTimeout={0}
                onValueChange={setName}
                errorMessage={errors?.errors['settings.name']}
              />
            </div>

            <Button behavior="button" disabled={savingName} onClick={saveName}>
              {t('save')}
            </Button>
          </div>
        </div>
      ) : null}

      {showBrand ? (
        <>
          {hasLogo ? (
            <div className="flex items-center gap-3">
              {logoFailed ? null : (
                <div
                  className="shrink-0 grid place-items-center border overflow-hidden"
                  style={{
                    width: '3rem',
                    height: '2.25rem',
                    borderColor: colors.$24,
                    borderRadius: '0.375rem',
                    backgroundColor: colors.$1,
                  }}
                >
                  <img
                    src={company?.settings?.company_logo}
                    alt=""
                    style={{ maxWidth: '2.5rem', maxHeight: '1.75rem' }}
                    onError={() => setLogoFailed(true)}
                  />
                </div>
              )}

              <Button
                type="secondary"
                behavior="button"
                disabled={uploading}
                onClick={() => filePicker.current?.click()}
              >
                {t('upload_logo_short')}
              </Button>
            </div>
          ) : (
            <div>
              <p
                className="text-sm mb-2"
                style={{ color: colors.$3, fontWeight: 500 }}
              >
                {t('setup_wizard_logo')}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="secondary"
                  behavior="button"
                  disabled={uploading}
                  onClick={() => filePicker.current?.click()}
                >
                  {t('add_company_logo')}
                </Button>

                <Button
                  type="secondary"
                  behavior="button"
                  disableWithoutIcon
                  onClick={onSkipLogo}
                >
                  {t('dismiss')}
                </Button>
              </div>
            </div>
          )}

          {errors?.errors.company_logo ? (
            <p className="text-xs text-red-600">
              {errors.errors.company_logo[0]}
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
                uploadLogo(file);
              }

              event.target.value = '';
            }}
          />
        </>
      ) : null}
    </div>
  );
}
