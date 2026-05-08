/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card, Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { cloneDeep } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { Settings } from '$app/common/interfaces/docuninja/api';
import { useColorScheme } from '$app/common/colors';

function WidgetDefaults() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const isInitialized = useRef(false);
  const settingsRef = useRef<Settings | null>(null);

  const [docuData] = useAtom(docuNinjaAtom);
  const docuCompanies = docuData?.companies;
  const id = docuCompanies?.[0]?.id;

  useEffect(() => {
    if (docuCompanies?.[0]?.settings && !isInitialized.current) {
      setSettings(docuCompanies[0].settings);
      settingsRef.current = docuCompanies[0].settings;
      isInitialized.current = true;
    }
  }, [docuCompanies?.[0]?.settings]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const handleSave = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      const updatedCompany = cloneDeep(docuCompanies?.[0]);

      if (updatedCompany) {
        updatedCompany.settings = settingsRef.current as Settings;
      }

      request(
        'PUT',
        docuNinjaEndpoint('/api/companies/:id', {
          id: id,
        }),
        updatedCompany,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          toast.success('updated_company');

          $refetch(['docuninja_login']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            const errorMessage =
              error.response.data.message || 'validation_errors';
            toast.error(errorMessage);
          } else {
            toast.error('error_title');
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const handleSettingsChange = (property: keyof Settings, value: any) => {
    setSettings((prev) => prev && { ...prev, [property]: value });
  };

  useSaveBtn(
    {
      onClick: handleSave,
      disableSaveButton: isFormBusy,
    },
    [isFormBusy]
  );

  if (!settings) {
    return null;
  }

  return (
    <>
      {errors && <ValidationAlert errors={errors} />}

      <Card
        title={t('widget_defaults')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <Element leftSide={t('show_label')}>
          <Toggle
            checked={settings.widget_show_label ?? false}
            onChange={(value: boolean) =>
              handleSettingsChange('widget_show_label', value)
            }
            disabled={isFormBusy}
          />
        </Element>

        <Element leftSide={t('border_style')}>
          <SelectField
            value={settings.widget_border_style ?? 'hidden'}
            onValueChange={(value) =>
              handleSettingsChange('widget_border_style', value)
            }
            disabled={isFormBusy}
            customSelector
            dismissable={false}
          >
            <option value="hidden">{t('hidden')}</option>
            <option value="dotted">{t('dotted')}</option>
            <option value="solid">{t('solid')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('border_color')}>
          <ColorPicker
            value={settings.widget_border_color ?? '#FF5733'}
            onValueChange={(value) =>
              handleSettingsChange('widget_border_color', value)
            }
            disabled={isFormBusy}
            includeDefaultPalette
            renderLabelBox={(color) => (
              <div
                className="rounded-md flex items-center space-x-2 border p-1 cursor-pointer"
                style={{ borderColor: colors.$24 }}
              >
                <div
                  className="w-7 h-7 rounded-sm"
                  style={{ backgroundColor: color }}
                />

                <span className="text-sm" style={{ color: colors.$3 }}>
                  {color.replace('#', '')}
                </span>
              </div>
            )}
          />
        </Element>
      </Card>
    </>
  );
}

export default WidgetDefaults;
