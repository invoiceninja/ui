/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { ArrowDown } from '$app/components/icons/ArrowDown';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useElementVisibility } from '../../hooks/useElementVisibility';

interface Props {
  targetId: string;
  enabled: boolean;
}

interface PillTheme {
  backgroundColor: string;
  hoverBackgroundColor: string;
  textColor: string;
  borderColor: string;
}

const Pill = styled.button<{ theme: PillTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.textColor};
  border-color: ${({ theme }) => theme.borderColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function JumpToPreviewButton({ targetId, enabled }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const isVisible = useElementVisibility(enabled ? targetId : null, {
    rootMargin: '-80px 0px -80px 0px',
  });

  if (!enabled) return null;
  if (isVisible === true) return null;

  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-10"
      style={{ zIndex: 40 }}
    >
      <Pill
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-x-2 rounded-full border px-4 py-2.5 shadow-md text-sm font-medium"
        theme={{
          backgroundColor: accentColor,
          hoverBackgroundColor: accentColor,
          textColor: colors.$1,
          borderColor: 'transparent',
        }}
      >
        <span>{t('preview')}</span>
        <ArrowDown color={colors.$1} size="1rem" strokeWidth="2" />
      </Pill>
    </div>
  );
}
