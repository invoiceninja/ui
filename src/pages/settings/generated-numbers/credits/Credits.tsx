/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ClickableElement, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { Settings } from '../../../../components/layouts/Settings';

export function Credits() {
  const [t] = useTranslation();
  const [pattern, setPattern] = useState<string>('');

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'generated_numbers'
    )}`;
  });

  const variables = [
    '{$counter}',
    '{$year}',
    '{$date:format}',
    '{$user_id}',
    '{$user_custom1}',
    '{$user_custom2}',
    '{$user_custom3}',
    '{$user_custom4}',
  ];

  return (
    <Settings title={t('generated_numbers')}>
      <Card title={`${t('generated_numbers')}: ${t('credits')}`}>
        <Element leftSide={t('number_pattern')}>
          <InputField
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPattern(e.target.value)
            }
            value={pattern}
            id="number_pattern"
          />
        </Element>
        <Element leftSide={t('number_counter')}>
          <InputField id="number_counter" />
        </Element>
      </Card>

      <Card>
        {variables.map((item, index) => (
          <ClickableElement
            onClick={() => setPattern(pattern + item)}
            key={index}
          >
            {item}
          </ClickableElement>
        ))}
      </Card>
    </Settings>
  );
}
