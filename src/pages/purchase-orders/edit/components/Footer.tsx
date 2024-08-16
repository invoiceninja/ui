/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { TabGroup } from '$app/components/TabGroup';
import { useTranslation } from 'react-i18next';
import { PurchaseOrderCardProps } from './Details';
import { Dispatch, SetStateAction } from 'react';
import Toggle from '$app/components/forms/Toggle';

interface Props extends PurchaseOrderCardProps {
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
}
export function Footer(props: Props) {
  const [t] = useTranslation();

  const {
    purchaseOrder,
    handleChange,
    isDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
    setIsDefaultTerms,
  } = props;

  const tabs = [t('terms'), t('footer'), t('public_notes'), t('private_notes')];

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs} withoutVerticalMargin>
        <div>
          <MarkdownEditor
            value={purchaseOrder.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />

          <Element
            className="mt-4"
            leftSide={
              <Toggle
                checked={isDefaultTerms}
                onValueChange={(value) => setIsDefaultTerms(value)}
              />
            }
            noExternalPadding
            noVerticalPadding
          >
            <span className="font-medium">{t('save_as_default_terms')}</span>
          </Element>
        </div>

        <div>
          <MarkdownEditor
            value={purchaseOrder.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />

          <Element
            className="mt-4"
            leftSide={
              <Toggle
                checked={isDefaultFooter}
                onValueChange={(value) => setIsDefaultFooter(value)}
              />
            }
            noExternalPadding
            noVerticalPadding
          >
            <span className="font-medium">{t('save_as_default_footer')}</span>
          </Element>
        </div>

        <div className="mb-4">
          <MarkdownEditor
            value={purchaseOrder.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div className="mb-4">
          <MarkdownEditor
            value={purchaseOrder.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>
      </TabGroup>
    </Card>
  );
}
