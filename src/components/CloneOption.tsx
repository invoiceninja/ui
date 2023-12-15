/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { IconType } from 'react-icons';
import styled from 'styled-components';
import { Icon as ReactFeatherIcon } from 'react-feather';
import { Icon } from './icons/Icon';
import { useColorScheme } from '$app/common/colors';

interface Props {
  onClick: () => void;
  icon: IconType | ReactFeatherIcon;
  label: string;
  commonActionsSection?: boolean;
}

const CloneOptionStyled = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;
export function CloneOption(props: Props) {
  const colors = useColorScheme();

  const { onClick, icon, label } = props;

  return (
    <CloneOptionStyled
      theme={{ hoverColor: colors.$5 }}
      className="flex flex-1 items-center space-x-10 text-base py-2 px-10 cursor-pointer"
      onClick={onClick}
    >
      <Icon element={icon} style={{ width: '1.35rem', height: '1.35rem' }} />
      <span>{label}</span>
    </CloneOptionStyled>
  );
}
