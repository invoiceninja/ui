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
import { Link as ReactRouterLink } from 'react-router-dom';
import { Import } from '../icons/Import';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';

interface Props {
  route: string;
}

const Button = styled.div`
  border: 1px solid ${(props) => props.theme.borderColor};
  background-color: ${(props) => props.theme.backgroundColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function ImportButton(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  return (
    <ReactRouterLink to={props.route}>
      <Button
        className="flex items-center space-x-2.5 border rounded-md px-4 py-2 shadow-sm"
        theme={{
          hoverColor: colors.$4,
          borderColor: colors.$5,
          backgroundColor: colors.$1,
        }}
      >
        <Import size="1.3rem" color={colors.$3} />

        <span className="hidden lg:flex text-sm font-medium">
          {t('import')}
        </span>
      </Button>
    </ReactRouterLink>
  );
}
