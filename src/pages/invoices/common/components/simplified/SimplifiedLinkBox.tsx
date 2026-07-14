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
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
  to: string;
  icon?: ReactNode;
  label: ReactNode;
  external?: boolean;
}

export function SimplifiedLinkBox({ to, icon, label, external }: Props) {
  const colors = useColorScheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (external) {
      window.open(to, '_blank');
      return;
    }
    navigate(to);
  };

  return (
    <Box
      className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
      theme={{
        backgroundColor: colors.$1,
        hoverBackgroundColor: colors.$4,
      }}
      onClick={handleClick}
      style={{ borderColor: colors.$24 }}
    >
      <div className="flex items-center space-x-2">
        {icon}

        <span className="text-sm" style={{ color: colors.$3 }}>
          {label}
        </span>
      </div>

      <div>
        <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
      </div>
    </Box>
  );
}
