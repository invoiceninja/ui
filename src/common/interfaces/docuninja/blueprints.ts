/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { AuthoredDocumentData } from '@docuninja/builder2.0';
import { Document } from '$app/common/interfaces/docuninja/api';

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  design_hash: string;
  created_at: string;
  updated_at: string;
  archived_at: string;
  is_deleted: boolean;
  is_template: boolean;
  template_kind: 'invoice_design' | 'uploaded_pdf' | 'authored_document';
  template?: string;
  document?: Document;
  grapesjs?: AuthoredDocumentData;
}
