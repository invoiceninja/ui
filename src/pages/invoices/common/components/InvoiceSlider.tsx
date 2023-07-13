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
import { Inline } from '$app/components/Inline';
import { Icon } from '$app/components/icons/Icon';
import { MdSend } from 'react-icons/md';
import { BiPlusCircle } from 'react-icons/bi';

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
      actionChildren={
        <Inline className="w-full divide-x space-x-0">
          {invoice && parseInt(invoice.status_id) < 4 ? (
            <ClickableElement
              className="text-center"
              to={`/payments/create?invoice=${invoice.id}&client=${invoice.client_id}`}
            >
              <Inline>
                <Icon element={BiPlusCircle} />
                <p>{t('enter_payment')}</p>
              </Inline>
            </ClickableElement>
          ) : null}

          <ClickableElement
            className="text-center"
            to={`/invoices/${invoice?.id}/email`}
          >
            <Inline>
              <Icon element={MdSend} />
              <p>{t('send_email')}</p>
            </Inline>
          </ClickableElement>
        </Inline>
      }
      withoutActionContainer
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
                  <ClickableElement key={i} to={`/invoices/${invoice.id}/edit`}>
                    <div className="flex flex-col text-gray-900">
                      <div className="flex items-center justify-between">
                        <p>{item.product_key}</p>
                        <p>
                          {invoice
                            ? formatMoney(
                                item.line_total,
                                invoice.client?.country_id ||
                                  company?.settings.country_id,
                                invoice.client?.settings.currency_id ||
                                  company?.settings.currency_id
                              )
                            : null}
                        </p>
                      </div>

                      <div className="text-gray-500">
                        {item.quantity}x &nbsp;
                        {item.notes.length > 45
                          ? item.notes.slice(0, 45).concat('...')
                          : item.notes}
                      </div>
                    </div>
                  </ClickableElement>
                ))
              : null}
          </div>
        </div>

        <div>Contacts</div>
      </TabGroup>
    </Slider>
  );
}
