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
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { useDesignsQuery } from '$app/common/queries/designs';
import { Card } from '$app/components/cards';
import { Default } from '$app/components/layouts/Default';
import { TabGroup } from '$app/components/TabGroup';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useDiscardChanges } from '$app/pages/settings/common/hooks/useDiscardChanges';
import {
  ClientDetails,
  CompanyAddress,
  CompanyDetails,
  CreditDetails,
  GeneralSettings,
  InvoiceDetails,
  ProductColumns,
  PurchaseOrderDetails,
  QuoteDetails,
  TaskColumns,
  TotalFields,
  VendorDetails,
} from '$app/pages/settings/invoice-design/components';
import {
  payloadAtom,
  useDesignUtilities,
} from '$app/pages/settings/invoice-design/customize/common/hooks';
import { variables } from '$app/pages/settings/invoice-design/customize/common/variables';
import { Body } from '$app/pages/settings/invoice-design/customize/components/Body';
import { Footer } from '$app/pages/settings/invoice-design/customize/components/Footer';
import { Header } from '$app/pages/settings/invoice-design/customize/components/Header';
import { Includes } from '$app/pages/settings/invoice-design/customize/components/Includes';
import { Settings } from '$app/pages/settings/invoice-design/customize/components/Settings';
import { Variable } from '$app/pages/settings/templates-and-reminders/common/components/Variable';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function Customize() {
  const [t] = useTranslation();
  const [payload, setPayload] = useAtom(payloadAtom);

  const { documentTitle } = useTitle('customize_and_preview');
  const { data: designs } = useDesignsQuery();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
    { name: t('customize_and_preview'), href: '/settings/design/customize' },
  ];

  const company = useInjectCompanyChanges();
  const discardChanges = useDiscardChanges();

  const { handleDesignChange } = useDesignUtilities();

  useEffect(() => {
    if (designs && company?.settings) {
      setPayload(
        (current) =>
          current && {
            ...current,
            settings: company.settings,
          }
      );
    }
  }, [designs, company?.settings]);

  useEffect(() => {
    if (company?.settings.invoice_design_id) {
      const design = designs?.find(
        (d) => d.id === company?.settings.invoice_design_id
      );

      if (design) {
        handleDesignChange(design);
      }
    }
  }, [company?.settings.invoice_design_id]);

  useEffect(() => {
    return () => {
      discardChanges();

      setPayload((current) => ({
        ...current,
        design: undefined,
        settings: null,
      }));
    };
  }, []);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/2">
          <TabGroup
            tabs={[t('settings'), t('design'), t('variables')]}
            withScrollableContent
            childrenClassName="max-h-[75vh]"
          >
            <div className="space-y-4">
              <GeneralSettings />
              <ClientDetails />
              <CompanyDetails />
              <CompanyAddress />
              <InvoiceDetails />
              <QuoteDetails />
              <CreditDetails />
              <VendorDetails />
              <PurchaseOrderDetails />
              <ProductColumns />
              <TaskColumns />
              <TotalFields />
            </div>

            <div className="space-y-4">
              <Settings payload={payload} />
              <Body payload={payload} />
              <Header payload={payload} />
              <Footer payload={payload} />
              <Includes payload={payload} />
            </div>

            <div className="space-y-4">
              <Card
                title={t('invoice')}
                padding="small"
                childrenClassName="px-2"
                collapsed={false}
              >
                <div className="px-2">
                  {variables.invoice.map((variable, index) => (
                    <Variable key={index}>{variable}</Variable>
                  ))}
                </div>
              </Card>

              <Card
                title={t('client')}
                padding="small"
                childrenClassName="px-2"
                collapsed={true}
              >
                <div className="px-2">
                  {variables.client.map((variable, index) => (
                    <Variable key={index}>{variable}</Variable>
                  ))}
                </div>
              </Card>

              <Card
                title={t('contact')}
                padding="small"
                childrenClassName="px-2"
                collapsed={true}
              >
                <div className="px-2">
                  {variables.contact.map((variable, index) => (
                    <Variable key={index}>{variable}</Variable>
                  ))}
                </div>
              </Card>

              <Card
                title={t('company')}
                padding="small"
                childrenClassName="px-2"
                collapsed={true}
              >
                <div className="px-2">
                  {variables.company.map((variable, index) => (
                    <Variable key={index}>{variable}</Variable>
                  ))}
                </div>
              </Card>
            </div>
          </TabGroup>
        </div>

        <div className="w-full lg:w-1/2 max-h-[82.5vh] overflow-y-scroll">
          <InvoiceViewer
            link={endpoint('/api/v1/live_design')}
            resource={payload}
            method="POST"
            withToast
          />
        </div>
      </div>
    </Default>
  );
}
