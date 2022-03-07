import { ChangeEvent } from 'react';
import { Vendor } from './vendor';

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
export interface VendorProps {
  data: Vendor;
  handleChange: (e: ChangeEvent) => void;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  errors?: any;
}
