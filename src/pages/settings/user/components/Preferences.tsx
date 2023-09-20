/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { updateChanges } from '$app/common/stores/slices/user';
import {
  preferencesDefaults,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { InputField } from '$app/components/forms';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { Inline } from '$app/components/Inline';
import { X } from 'react-feather';
import { get } from 'lodash';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { ReactNode } from 'react';

export function Preferences() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const reactSettings = useReactSettings();

  const handleChange = (property: string, value: string | boolean) => {
    dispatch(
      updateChanges({
        property: property,
        value: value,
      })
    );
  };

  const resolveCurrency = useResolveCurrency();

  return (
    <div className="space-y-4">
      <Card title={t('preferences')}>
        <Element leftSide={t('show_pdf_preview')}>
          <Toggle
            checked={
              typeof reactSettings.show_pdf_preview === 'boolean'
                ? reactSettings.show_pdf_preview
                : true
            }
            onValueChange={(value) =>
              handleChange(
                'company_user.react_settings.show_pdf_preview',
                value
              )
            }
          />
        </Element>

        <Element leftSide={t('show_document_preview')}>
          <Toggle
            checked={Boolean(reactSettings.show_document_preview)}
            onValueChange={(value) =>
              handleChange(
                'company_user.react_settings.show_document_preview',
                value
              )
            }
          />
        </Element>

        <Element
          leftSide={t('react_notification_link')}
          leftSideHelp={t('react_notification_link_help')}
        >
          <Toggle
            checked={reactSettings.react_notification_link}
            onValueChange={(value) =>
              handleChange(
                'company_user.react_settings.react_notification_link',
                value
              )
            }
          />
        </Element>

        <Element
          leftSide={t('number_precision')}
          leftSideHelp={t('number_precision_help')}
        >
          <InputField
            value={reactSettings?.number_precision}
            onValueChange={(value) =>
              handleChange(
                'company_user.react_settings.number_precision',
                value
              )
            }
            type="number"
            placeholder={t('number_precision')}
          />
        </Element>
      </Card>

      <Card title={t('dashboard')}>
        <Preference
          text={t('default_view')}
          path="dashboard_charts.default_view"
          format={(value) => <p className="uppercase">{value}</p>}
        />

        <Preference
          text={t('currency')}
          path="dashboard_charts.currency"
          format={(value) => {
            const currency = resolveCurrency(value.toString());

            if (currency) {
              return currency.code;
            }

            return value;
          }}
        />
      </Card>
    </div>
  );
}

interface PreferenceProps {
  text: string;
  path: string;
  format: (value: string | number | boolean) => string | ReactNode;
}

function Preference({ text, path, format }: PreferenceProps) {
  const { preferences, update } = usePreferences();
  const { t } = useTranslation();

  return (
    <Element leftSide={text}>
      <Inline className="space-x-2">
        <div>{format(get(preferences, path))}</div>

        {get(preferencesDefaults, path) === get(preferences, path) ? (
          <small>({t('default')})</small>
        ) : (
          <button
            type="button"
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              update(`preferences.${path}`, get(preferencesDefaults, path));
            }}
            aria-label="Reset to default"
          >
            <X size={18} />
          </button>
        )}
      </Inline>
    </Element>
  );
}
