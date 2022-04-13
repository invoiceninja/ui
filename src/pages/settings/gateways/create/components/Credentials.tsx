/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Link } from '@invoiceninja/forms';
import { Gateway } from 'common/interfaces/statics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatLabel } from '../helpers/format-label';
import { Field, useResolveInputField } from '../hooks/useResolveInputField';

interface Props {
  gateway: Gateway;
}

export function Credentials(props: Props) {
  const [t] = useTranslation();
  const [gateway, setGateway] = useState<Gateway>(props.gateway);
  const [fields, setFields] = useState<Record<string, Field>>({});

  useEffect(() => setGateway(props.gateway), [props.gateway]);
  useEffect(() => setFields(JSON.parse(gateway.fields)), [gateway]);

  const resolveInputField = useResolveInputField();

  return (
    <Card title={t('credentials')}>
      {props.gateway.site_url.length >= 1 && (
        <Element leftSide={t('help')}>
          <Link external to={props.gateway.site_url}>
            {t('learn_more')}
          </Link>
        </Element>
      )}

      {fields &&
        Object.keys(fields).map((field, index) => (
          <Element leftSide={formatLabel(field)} key={index}>
            {resolveInputField(field, fields[field])}
          </Element>
        ))}
    </Card>
  );
}
