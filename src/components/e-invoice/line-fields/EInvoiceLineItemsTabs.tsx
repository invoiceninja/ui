/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { TabGroup } from '$app/components/TabGroup';
import { EInvoiceType } from '$app/pages/settings';
import { EInvoiceLines, EInvoiceLinesResource } from './EInvoiceLines';
import { EInvoiceLinesTabLabel } from './EInvoiceLinesTabLabel';
import { EInvoiceLinesRoot } from './fields';
import { useEInvoiceLineFields } from './useEInvoiceLineFields';

interface Props {
  resource: EInvoiceLinesResource;
  root: EInvoiceLinesRoot;
  client?: Client;
  errors?: ValidationBag;
  onChange: (eInvoice: EInvoiceType) => unknown;
  children: ReactElement;
}

export function EInvoiceLineItemsTabs(props: Props) {
  const [t] = useTranslation();

  const fields = useEInvoiceLineFields(props.resource, props.root);

  if (!fields.length) {
    return props.children;
  }

  return (
    <TabGroup
      tabs={[t('products'), t('e_invoice_line_fields')]}
      formatTabLabel={(index) =>
        index === 1 ? (
          <EInvoiceLinesTabLabel
            eInvoice={props.resource.e_invoice}
            root={props.root}
            errors={props.errors}
          />
        ) : undefined
      }
    >
      <div>{props.children}</div>

      <EInvoiceLines
        resource={props.resource}
        root={props.root}
        fields={fields}
        client={props.client}
        errors={props.errors}
        onChange={props.onChange}
      />
    </TabGroup>
  );
}
