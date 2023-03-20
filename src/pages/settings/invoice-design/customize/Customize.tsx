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
import { useTitle } from '$app/common/hooks/useTitle';
import { Design } from '$app/common/interfaces/design';
import { useDesignsQuery } from '$app/common/queries/designs';
import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Default } from '$app/components/layouts/Default';
import { TabGroup } from '$app/components/TabGroup';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface Payload {
  design: Design | null;
  entity_id: string;
  entity_type: 'invoice';
}

export function Customize() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('customize_and_preview');
  const { data: designs } = useDesignsQuery();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
    { name: t('customize_and_preview'), href: '/settings/design/customize' },
  ];

  const [payload, setPayload] = useState<Payload | null>({
    design: null,
    entity_id: '',
    entity_type: 'invoice',
  });

  useEffect(() => {
    if (designs) {
      setPayload(
        (current) =>
          current && { ...current, design: { ...designs[0], id: '-1' } }
      );
    }
  }, [designs]);

  useEffect(() => {
    if (payload?.design) {
    }
  }, [payload?.design]);

  const handleDesignChange = useCallback(
    (id: string) => {
      const design = designs?.find((design) => design.id === id);

      if (design) {
        setPayload(
          (current) =>
            current && { ...current, design: { ...design, id: '-1' } }
        );
      }
    },
    [designs]
  );

  const handleDesignPropertyChange = useCallback(
    (property: keyof Design, value: string | number) => {
      setPayload(
        (current) =>
          current &&
          current.design && {
            ...current,
            design: { ...current.design, [property]: value },
          }
      );
    },
    [designs]
  );

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <TabGroup tabs={[t('settings'), t('body')]}>
            <Card>
              <Element leftSide={t('name')}>
                <InputField
                  onValueChange={(value) =>
                    handleDesignPropertyChange('name', value)
                  }
                  debounceTimeout={500}
                />
              </Element>

              <Element leftSide={t('design')}>
                <SelectField
                  defaultValue={payload?.design?.id || ''}
                  onValueChange={(value) => handleDesignChange(value)}
                >
                  {designs &&
                    designs.map((design) => (
                      <option key={design.id} value={design.id}>
                        {design.name}
                      </option>
                    ))}
                </SelectField>
              </Element>

              <Element leftSide={t('html_mode')}>
                <Toggle checked={false} />
              </Element>
            </Card>

            <div>Body</div>
          </TabGroup>
        </div>

        <div className="col-span-12 lg:col-span-7">
          {payload?.design && (
            <InvoiceViewer
              link={endpoint('/api/v1/preview')}
              resource={payload}
              method="POST"
              withToast
            />
          )}
        </div>
      </div>
    </Default>
  );
}
