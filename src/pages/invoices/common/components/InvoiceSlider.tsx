/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { TabGroup } from '$app/components/TabGroup';
import { ClickableElement, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { openClientPortal } from '../helpers/open-client-portal';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date } from '$app/common/helpers';

export const invoiceSliderAtom = atom<Invoice | null>(null);
export const invoiceSliderVisibilityAtom = atom(false);

export function InvoiceSlider() {
  const [isVisible, setIsSliderVisible] = useAtom(invoiceSliderVisibilityAtom);
  const [invoice, setInvoice] = useAtom(invoiceSliderAtom);
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const { dateFormat } = useCurrentCompanyDateFormats();

  return (
    <Slider
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setInvoice(null);
      }}
      size="regular"
      title={`${t('invoice')} ${invoice?.number}`}
    >
      <TabGroup tabs={[t('overview'), t('contacts')]} width="full">
        <div className="space-y-4">
          <div>
            <Element leftSide={t('invoice_amount')}>
              {invoice
                ? formatMoney(
                    invoice?.amount,
                    invoice.client?.country_id || company?.settings.country_id,
                    invoice.client?.settings.currency_id ||
                      company?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('balance_due')}>
              {invoice
                ? formatMoney(
                    invoice.balance,
                    invoice.client?.country_id || company?.settings.country_id,
                    invoice.client?.settings.currency_id ||
                      company?.settings.currency_id
                  )
                : null}
            </Element>
          </div>

          <Divider withoutPadding />

          <div>
            <ClickableElement
              onClick={() => (invoice ? openClientPortal(invoice) : null)}
            >
              {t('view_portal')}
            </ClickableElement>
          </div>

          <Divider withoutPadding />

          <div>
            <Element leftSide={t('date')}>
              {invoice ? date(invoice?.date, dateFormat) : null}
            </Element>
          </div>

          <Divider withoutPadding />

          <div>
            {invoice
              ? invoice.line_items.map((item, i) => (
                  <ClickableElement key={i}>
                    <div className="flex flex-col text-gray-900">
                      <div className="flex items-center justify-between">
                        <p>Product</p>
                        <p>$0</p>
                      </div>

                      <div className="text-gray-500">
                        1x lorem ipsum &middot; Tax %
                      </div>
                    </div>
                  </ClickableElement>
                ))
              : null}
          </div>

          <Divider withoutPadding />

          <div className="flex justify-end px-5 sm:px-6">
            <div className="flex flex-col">
              <div>1</div>
              <div>2</div>
              <div>3</div>
            </div>
          </div>
        </div>

        <div>Contacts</div>
      </TabGroup>
    </Slider>
  );
}
