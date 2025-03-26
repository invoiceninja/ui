/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import styled from 'styled-components';

interface Props {
  color?: string;
  size?: string;
  circleColor?: string; // Renamed from borderColor
  borderColor?: string; // New prop for stroke
  hoverColor?: string;
  hoverCircleColor?: string; // For hovering the fill
  hoverBorderColor?: string; // For hovering the stroke
  borderWidth?: string;
}

const StyledSvg = styled.svg`
  & path[data-color='color-2'] {
    fill: ${({ theme }) => theme.circleColor};
    stroke: ${({ theme }) => theme.borderColor};
    stroke-width: ${({ theme }) => theme.borderWidth};
  }

  & path:not([data-color='color-2']) {
    fill: ${({ theme }) => theme.color};
  }

  &:hover path[data-color='color-2'] {
    fill: ${({ theme }) => theme.hoverCircleColor || theme.circleColor};
    stroke: ${({ theme }) => theme.hoverBorderColor || theme.borderColor};
  }

  &:hover path:not([data-color='color-2']) {
    fill: ${({ theme }) => theme.hoverColor || theme.color};
  }
`;

export function CircleDots({
  color = 'black',
  size = '1.2rem',
  circleColor = '#000',
  borderColor = 'black',
  borderWidth = '0.75',
  hoverColor,
  hoverCircleColor,
  hoverBorderColor,
}: Props) {
  return (
    <StyledSvg
      className="drop-shadow-sm"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ height: size, width: size }}
      viewBox="0 0 18 18"
      theme={{
        color,
        circleColor,
        borderColor,
        borderWidth,
        hoverColor,
        hoverCircleColor,
        hoverBorderColor,
      }}
    >
      <path
        d="M9.00012 17C13.4184 17 17.0001 13.4183 17.0001 9C17.0001 4.58172 13.4184 1 9.00012 1C4.58184 1 1.00012 4.58172 1.00012 9C1.00012 13.4183 4.58184 17 9.00012 17Z"
        data-color="color-2"
      ></path>
      <path d="M9.00012 10C8.44912 10 8.00012 9.551 8.00012 9C8.00012 8.449 8.44912 8 9.00012 8C9.55112 8 10.0001 8.449 10.0001 9C10.0001 9.551 9.55112 10 9.00012 10Z"></path>
      <path d="M5.50012 10C4.94912 10 4.50012 9.551 4.50012 9C4.50012 8.449 4.94912 8 5.50012 8C6.05112 8 6.50012 8.449 6.50012 9C6.50012 9.551 6.05112 10 5.50012 10Z"></path>
      <path d="M12.5001 10C11.9491 10 11.5001 9.551 11.5001 9C11.5001 8.449 11.9491 8 12.5001 8C13.0511 8 13.5001 8.449 13.5001 9C13.5001 9.551 13.0511 10 12.5001 10Z"></path>
    </StyledSvg>
  );
}
