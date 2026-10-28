/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useScrollToLineItem } from '$app/common/hooks/useScrollToLineItem';
import { Card } from '$app/components/cards';
import { EInvoiceLines } from '$app/components/e-invoice/line-fields/EInvoiceLines';
import { EInvoiceLinesTabLabel } from '$app/components/e-invoice/line-fields/EInvoiceLinesTabLabel';
import { useEInvoiceLineFields } from '$app/components/e-invoice/line-fields/useEInvoiceLineFields';
import { HiddenResourceTaxesAlert } from '$app/components/HiddenResourceTaxesAlert';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { ClientSelector } from '$app/pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { CreditDetails } from '../common/components/CreditDetails';
import { CreditProductsTable } from '../common/components/CreditProductsTable';
import { CreditFooter } from '../common/components/CreditFooter';
import { CreditStatus as CreditStatusBadge } from '../common/components/CreditStatus';
import { useCreditUtilities } from '../common/hooks';
import { CreditsContext } from '../create/Create';

export default function Edit() {
  const [t] = useTranslation();

  const context: CreditsContext = useOutletContext();
  const {
    credit,
    errors,
    client,
    invoiceSum,
    isDefaultTerms,
    setIsDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
  } = context;

  const colors = useColorScheme();
  const reactSettings = useReactSettings();
  const eInvoiceLineFields = useEInvoiceLineFields(credit, 'CreditNote');

  useScrollToLineItem(Boolean(credit && client));

  const { handleChange, handleInvitationChange, handleContactCanSignChange } =
    useCreditUtilities({ client });

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-4 h-max px-6 py-2 shadow-sm"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col space-y-4">
            {credit && (
              <div className="flex items-center space-x-9">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('status')}
                </span>

                <div>
                  <CreditStatusBadge entity={credit} />
                </div>
              </div>
            )}

            <ClientSelector
              resource={credit}
              onChange={(id) => handleChange('client_id', id)}
              onClearButtonClick={() => handleChange('client_id', '')}
              onLocationChange={(locationId) =>
                handleChange('location_id', locationId)
              }
              onContactCheckboxChange={handleInvitationChange}
              onContactCanSignCheckboxChange={handleContactCanSignChange}
              errorMessage={errors?.errors.client_id}
              readonly
              textOnly
            />
          </div>
        </Card>

        <CreditDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          {credit && (
            <HiddenResourceTaxesAlert className="mb-2" resource={credit} />
          )}

          {credit ? (
            eInvoiceLineFields.length ? (
              <TabGroup
                tabs={[t('products'), t('e_invoice_line_fields')]}
                formatTabLabel={(index) => {
                  if (index === 1) {
                    return (
                      <EInvoiceLinesTabLabel
                        eInvoice={credit.e_invoice}
                        root="CreditNote"
                        errors={errors}
                      />
                    );
                  }
                }}
              >
                <div>
                  <CreditProductsTable client={client} />
                </div>

                <EInvoiceLines
                  resource={credit}
                  root="CreditNote"
                  fields={eInvoiceLineFields}
                  client={client}
                  errors={errors}
                  onChange={(eInvoice) => handleChange('e_invoice', eInvoice)}
                />
              </TabGroup>
            ) : (
              <CreditProductsTable client={client} />
            )
          ) : (
            <Spinner />
          )}
        </div>

        <CreditFooter
          handleChange={handleChange}
          errors={errors}
          isDefaultFooter={isDefaultFooter}
          isDefaultTerms={isDefaultTerms}
          setIsDefaultFooter={setIsDefaultFooter}
          setIsDefaultTerms={setIsDefaultTerms}
        />

        {credit && (
          <InvoiceTotals
            relationType="client_id"
            resource={credit}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {credit && (
            <InvoicePreview
              for="invoice"
              resource={credit}
              entity="credit"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              withRemoveLogoCTA
              observable={true}
              initiallyVisible={false}
            />
          )}
        </div>
      )}
    </>
  );
}
