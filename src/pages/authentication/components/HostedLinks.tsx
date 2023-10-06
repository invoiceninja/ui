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
import { Lock, Smartphone, Book } from 'react-feather';
import { styled } from 'styled-components';

const StyledLink = styled.a`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function HostedLinks() {
  const colors = useColorScheme();

  return (
    <div
      className="grid grid-cols-3 text-sm border rounded"
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$5,
        color: colors.$3,
      }}
    >
      <div className="col-span-3 md:col-span-1">
        <StyledLink
          theme={{ hoverColor: colors.$2 }}
          href="https://status.invoiceninja.com/"
          target="_blank"
          className="py-3 w-full px-2 inline-flex justify-center items-center rounded-l"
          rel="noreferrer"
        >
          <Lock size={15} />
          <span className="m-1">Check status</span>
        </StyledLink>
      </div>
      <div className="col-span-3 md:col-span-1">
        <StyledLink
          theme={{ hoverColor: colors.$2 }}
          href="https://www.invoiceninja.com/mobile/"
          target="_blank"
          className="py-3 w-full px-2 inline-flex justify-center items-center"
          rel="noreferrer"
        >
          <Smartphone size={15} />
          <span className="m-1">Applications</span>
        </StyledLink>
      </div>
      <div className="col-span-3 md:col-span-1">
        <StyledLink
          theme={{ hoverColor: colors.$2 }}
          href="https://invoiceninja.github.io"
          target="_blank"
          className="py-3 w-full hover:bg-gray-100 px-2 inline-flex justify-center items-center rounded-r"
          rel="noreferrer"
        >
          <Book size={15} />
          <span className="m-1">Documentation</span>
        </StyledLink>
      </div>
    </div>
  );
}
