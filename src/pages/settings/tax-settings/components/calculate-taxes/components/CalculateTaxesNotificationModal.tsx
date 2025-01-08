/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { $help } from '$app/components/HelpWidget';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineWarning } from 'react-icons/md';

export function CalculateTaxesNotificationModal() {
  const { t } = useTranslation();

  const accentColor = useAccentColor();
  const companyChanges = useCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleToggleCheck = (value: boolean, closeModal?: boolean) => {
    handleChange('calculate_taxes', value);

    if (value) {
      handleChange('enabled_tax_rates', 0);
      handleChange('enabled_item_tax_rates', 1);
      handleChange('enabled_expense_tax_rates', 1);

      handleChange('settings.tax_rate1', 0);
      handleChange('settings.tax_rate2', 0);
      handleChange('settings.tax_rate3', 0);

      handleChange('settings.inclusive_taxes', false);
    }

    if (closeModal) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Modal
        title={t('calculate_taxes')}
        visible={isModalOpen}
        onClose={() => handleToggleCheck(false, true)}
      >
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <div>
              <Icon element={MdOutlineWarning} color="orange" size={24} />
            </div>

            <span className="font-medium text-center break-words">
              {t('calculate_taxes_warning')}.
            </span>
          </div>

          <div className="flex justify-between">
            <Button
              type="secondary"
              behavior="button"
              onClick={() => handleToggleCheck(false, true)}
            >
              {t('cancel')}
            </Button>

            <Button behavior="button" onClick={() => setIsModalOpen(false)}>
              {t('continue')}
            </Button>
          </div>
        </div>
      </Modal>

      <Element
        leftSide={t('calculate_taxes')}
        leftSideHelp={t('calculate_taxes_help')}
      >
        <div className="flex items-center gap-4">
          <Toggle
            checked={Boolean(companyChanges?.calculate_taxes)}
            onValueChange={(value) => {
              handleChange('calculate_taxes', value);

              if (value) {
                setIsModalOpen(true);
              }
            }}
          />

          <button
            type="button"
            style={{ color: accentColor }}
            onClick={() =>
              $help('calculate-taxes', {
                moveToHeading: 'Turn on Calculate Taxes',
              })
            }
            className="inline-flex items-center space-x-1"
          >
            <span>{t('learn_more')}</span>
          </button>
        </div>
      </Element>
    </>
  );
}
