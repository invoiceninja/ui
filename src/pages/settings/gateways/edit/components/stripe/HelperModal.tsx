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

import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useColorScheme } from '$app/common/colors';
import { LuCheckCircle2 } from 'react-icons/lu';
import { CreditCard } from 'react-feather';
import { Sliders } from 'react-feather';

interface props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setTabIndex: Dispatch<SetStateAction<number>>;
}

export function HelperModal({ visible, setVisible, setTabIndex }: props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const accentColor = useAccentColor();

  return (
    <Modal
      title={t('gateway_setup_complete')}
      visible={visible}
      onClose={() => setVisible(false)}
      size="regular"
    >
      <div className="flex flex-col space-y-6 pb-2">
        <div className="flex flex-col items-center text-center space-y-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <LuCheckCircle2 size={24} style={{ color: accentColor }} />
          </div>

          <p className="text-sm" style={{ color: colors.$17 }}>
            {t('gateway_onboarding_description')}
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            type="button"
            className="flex items-center space-x-3 p-3 rounded-md border text-left transition-colors hover:opacity-80"
            style={{ borderColor: colors.$20 }}
            onClick={() => {
              setVisible(false);
              setTabIndex(2);
            }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <CreditCard size={16} style={{ color: accentColor }} />
            </div>

            <div className="flex flex-col">
              <span
                className="text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {t('payment_methods')}
              </span>

              <span className="text-xs" style={{ color: colors.$17 }}>
                {t('gateway_onboarding_payment_methods_help')}
              </span>
            </div>
          </button>

          <button
            type="button"
            className="flex items-center space-x-3 p-3 rounded-md border text-left transition-colors hover:opacity-80"
            style={{ borderColor: colors.$20 }}
            onClick={() => {
              setVisible(false);
              setTabIndex(4);
            }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Sliders size={16} style={{ color: accentColor }} />
            </div>

            <div className="flex flex-col">
              <span
                className="text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {t('limits_and_fees')}
              </span>

              <span className="text-xs" style={{ color: colors.$17 }}>
                {t('gateway_onboarding_limits_fees_help')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}
