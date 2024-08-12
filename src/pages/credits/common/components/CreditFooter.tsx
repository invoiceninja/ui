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
import { Link } from '$app/components/forms';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { TabGroup } from '$app/components/TabGroup';
import { useTranslation } from 'react-i18next';
import Toggle from '$app/components/forms/Toggle';
import { ChangeHandler } from '../hooks';
import { useAtom } from 'jotai';
import { creditAtom } from '../atoms';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
}

export function CreditFooter(props: Props) {
  const [t] = useTranslation();

  const {
    handleChange,
    isDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
    setIsDefaultTerms,
  } = props;

  const { isAdmin, isOwner } = useAdmin();

  const [credit] = useAtom(creditAtom);

  const tabs = [
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    ...(isAdmin || isOwner ? [t('custom_fields')] : []),
  ];

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs} withoutVerticalMargin>
        <div>
          <MarkdownEditor
            value={credit?.terms || ''}
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
            value={credit?.footer || ''}
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
            value={credit?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div className="mb-4">
          <MarkdownEditor
            value={credit?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div className="my-4">
          <span className="text-sm">{t('custom_fields')} &nbsp;</span>
          <Link to="/settings/custom_fields/invoices" className="capitalize">
            {t('click_here')}
          </Link>
        </div>
      </TabGroup>
    </Card>
  );
}
