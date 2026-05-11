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
import { CreditCard, Sliders } from 'react-feather';
import { Icon } from '$app/components/icons/Icon';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import styled from 'styled-components';

interface BoxTheme {
  backgroundColor: string;
  hoverBackgroundColor: string;
}

const Box = styled.div<{ theme: BoxTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setTabIndex: Dispatch<SetStateAction<number>>;
}

export function HelperModal({ visible, setVisible, setTabIndex }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const accentColor = useAccentColor();

  return (
    <Modal
      title={t('gateway_setup_complete')}
      visible={true}
      onClose={() => setVisible(false)}
      size="regular"
    >
      <div className="flex flex-col space-y-6 pb-2">
        <div className="flex flex-col items-center text-center space-y-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon element={LuCheckCircle2} size={24} color={accentColor} />
          </div>

          <p className="text-sm" style={{ color: colors.$17 }}>
            {t('gateway_onboarding_description')}
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Box
            className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
            theme={{
              backgroundColor: colors.$1,
              hoverBackgroundColor: colors.$4,
            }}
            style={{ borderColor: colors.$24 }}
            onClick={() => {
              setVisible(false);
              setTabIndex(2);
            }}
          >
            <div className="flex items-center space-x-3">
              <CreditCard size={18} style={{ color: colors.$3 }} />

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
            </div>

            <div>
              <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
            </div>
          </Box>

          <Box
            className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
            theme={{
              backgroundColor: colors.$1,
              hoverBackgroundColor: colors.$4,
            }}
            style={{ borderColor: colors.$24 }}
            onClick={() => {
              setVisible(false);
              setTabIndex(4);
            }}
          >
            <div className="flex items-center space-x-3">
              <Sliders size={18} style={{ color: colors.$3 }} />

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
            </div>

            <div>
              <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
            </div>
          </Box>
        </div>
      </div>
    </Modal>
  );
}
