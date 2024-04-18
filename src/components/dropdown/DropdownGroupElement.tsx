/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode, useState } from 'react';
import { Icon } from '../icons/Icon';
import { MdArrowBackIosNew } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';
import { IconType } from 'react-icons';
import classNames from 'classnames';

interface Props {
  label: string;
  collapsed?: boolean;
  children: ReactNode;
  showGroup?: boolean;
  icon: IconType;
}

const Div = styled.div`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function DropdownGroupElement(props: Props) {
  const { collapsed, label, children, showGroup, icon } = props;

  const colors = useColorScheme();

  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? true);

  if (!showGroup) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col cursor-pointer">
      <Div
        className="flex py-2 px-4 justify-between items-center rounded-lg"
        theme={{
          color: colors.$3,
          hoverColor: colors.$7,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex space-x-2 items-center">
          <Icon element={icon} />

          <span>{label}</span>
        </div>

        <div onClick={() => setIsCollapsed((current) => !current)}>
          {isCollapsed ? (
            <Icon
              element={MdArrowBackIosNew}
              style={{ rotate: '270deg' }}
              size={17}
            />
          ) : (
            <Icon
              element={MdArrowBackIosNew}
              style={{ rotate: '90deg' }}
              size={17}
            />
          )}
        </div>
      </Div>

      <div className={classNames('flex flex-col', { hidden: isCollapsed })}>
        {children}
      </div>
    </div>
  );
}
