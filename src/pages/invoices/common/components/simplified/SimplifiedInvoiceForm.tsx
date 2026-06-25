/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem, InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ChangeHandler } from '$app/pages/invoices/create/Create';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { InvoicePreview } from '../InvoicePreview';
import { JumpToPreviewButton } from './JumpToPreviewButton';
import { SimplifiedClientCard } from './SimplifiedClientCard';
import { SimplifiedFooterCard } from './SimplifiedFooterCard';
import { SimplifiedInvoiceMeta } from './SimplifiedInvoiceMeta';
import { SimplifiedItemsSection } from './SimplifiedItemsSection';
import { SimplifiedLinkBox } from './SimplifiedLinkBox';
import { SimplifiedNotesAdvanced } from './SimplifiedNotesAdvanced';
import { SimplifiedTermsCard } from './SimplifiedTermsCard';
import { SimplifiedTotalsCard } from './SimplifiedTotalsCard';

const PDF_PREVIEW_ANCHOR_ID = 'invoice-pdf-preview';
const TOTALS_ANCHOR_ID = 'invoice-totals-card';

interface Props {
  mode: 'create' | 'edit';
  invoice?: Invoice;
  client?: Client;
  errors: ValidationBag | undefined;
  clientCreationErrors?: ValidationBag;
  invoiceSum?: InvoiceSum | InvoiceSumInclusive;
  handleChange: ChangeHandler;
  handleInvitationChange: (contactId: string, value: boolean) => unknown;
  handleLineItemChange: (index: number, lineItem: InvoiceItem) => unknown;
  handleLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => unknown;
  handleCreateLineItem: (type: InvoiceItemType) => unknown;
  handleDeleteLineItem: (index: number) => unknown;
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  readonlyClient?: boolean;
  disableWithSpinner?: boolean;
}

export function SimplifiedInvoiceForm({
  mode,
  invoice,
  errors,
  clientCreationErrors,
  invoiceSum,
  handleChange,
  handleInvitationChange,
  handleLineItemChange,
  handleLineItemPropertyChange,
  handleCreateLineItem,
  handleDeleteLineItem,
  isDefaultTerms,
  isDefaultFooter,
  setIsDefaultTerms,
  setIsDefaultFooter,
  readonlyClient,
  disableWithSpinner,
}: Props) {
  const [t] = useTranslation();
  const reactSettings = useReactSettings();
  const { isAdmin, isOwner } = useAdmin();

  const resetClientFields = () => {
    handleChange('client_id', '');
    handleChange('location_id', '');
    handleChange('tax_name1', '');
    handleChange('tax_rate1', 0);
    handleChange('tax_name2', '');
    handleChange('tax_rate2', 0);
    handleChange('tax_name3', '');
    handleChange('tax_rate3', 0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <SimplifiedClientCard
          invoice={invoice}
          errors={errors}
          clientCreationErrors={clientCreationErrors}
          onChange={(id) => handleChange('client_id', id)}
          onLocationChange={(id) => handleChange('location_id', id)}
          onClearButtonClick={resetClientFields}
          onContactCheckboxChange={handleInvitationChange}
          readonly={readonlyClient}
          disableWithSpinner={disableWithSpinner}
        />

        <SimplifiedInvoiceMeta
          mode={mode}
          invoice={invoice}
          handleChange={handleChange}
          errors={errors}
        />
      </div>

      <SimplifiedItemsSection
        invoice={invoice}
        onLineItemChange={handleLineItemChange}
        onLineItemPropertyChange={handleLineItemPropertyChange}
        onCreateLineItem={handleCreateLineItem}
        onDeleteLineItem={handleDeleteLineItem}
        onSort={(items) => handleChange('line_items', items)}
      />

      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 xl:col-span-8">
          <SimplifiedTermsCard
            invoice={invoice}
            handleChange={handleChange}
            isDefaultTerms={isDefaultTerms}
            setIsDefaultTerms={setIsDefaultTerms}
          />
        </div>

        {invoice && (
          <div
            id={TOTALS_ANCHOR_ID}
            className="col-span-12 xl:col-span-4 scroll-mt-24"
          >
            <SimplifiedTotalsCard
              relationType="client_id"
              resource={invoice}
              invoiceSum={invoiceSum}
              onChange={(property, value) =>
                handleChange(property, value as string)
              }
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <SimplifiedFooterCard
          invoice={invoice}
          handleChange={handleChange}
          isDefaultFooter={isDefaultFooter}
          setIsDefaultFooter={setIsDefaultFooter}
        />

        <SimplifiedNotesAdvanced invoice={invoice} handleChange={handleChange} />
      </div>

      {(isAdmin || isOwner) && (
        <SimplifiedLinkBox
          to="/settings/custom_fields/invoices"
          label={t('custom_fields')}
        />
      )}

      {reactSettings?.show_pdf_preview && invoice && (
        <div id={PDF_PREVIEW_ANCHOR_ID} className="my-4 scroll-mt-24">
          <InvoicePreview
            for={mode === 'create' ? 'create' : 'invoice'}
            resource={invoice}
            entity="invoice"
            relationType="client_id"
            endpoint="/api/v1/live_preview?entity=:entity"
            observable={true}
            initiallyVisible={false}
            withRemoveLogoCTA={mode === 'edit'}
          />
        </div>
      )}

      <JumpToPreviewButton
        targetId={PDF_PREVIEW_ANCHOR_ID}
        enabled={Boolean(
          reactSettings?.show_pdf_preview && invoice && invoice.client_id
        )}
      />
    </div>
  );
}
