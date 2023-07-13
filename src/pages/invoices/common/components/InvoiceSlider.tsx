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
import {
  generateClientPortalUrl,
  openClientPortal,
} from '../helpers/open-client-portal';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date } from '$app/common/helpers';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../../edit/components/Actions';
import { toast } from '$app/common/helpers/toast/toast';

export const invoiceSliderAtom = atom<Invoice | null>(null);
export const invoiceSliderVisibilityAtom = atom(false);

export function InvoiceSlider() {
  const [isVisible, setIsSliderVisible] = useAtom(invoiceSliderVisibilityAtom);
  const [invoice, setInvoice] = useAtom(invoiceSliderAtom);
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const actions = useActions();

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
      topRight={
        invoice ? (
          <ResourceActions
            label={t('more_actions')}
            resource={invoice}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
    >
      <TabGroup tabs={[t('overview'), t('history')]} width="full">
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

            {invoice ? (
              <ClickableElement
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateClientPortalUrl(invoice) ?? ''
                  );

                  toast.success('copied_to_clipboard', { value: '' });
                }}
              >
                {t('copy_link')}
              </ClickableElement>
            ) : null}
          </div>

          <Divider withoutPadding />

          <div>
            <Element leftSide={t('date')}>
              {invoice ? date(invoice?.date, dateFormat) : null}
            </Element>
          </div>

          <Divider withoutPadding />

          <div></div>
        </div>

        <div></div>
      </TabGroup>
    </Slider>
  );
}
