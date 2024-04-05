/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tooltip } from './Tooltip';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';
import { Icon as ReactFeatherIcon } from 'react-feather';
import { Icon } from './icons/Icon';
import { DropdownElement } from './dropdown/DropdownElement';
import CommonProps from '$app/common/interfaces/common-props.interface';
import { Entity } from './CommonActionsPreferenceModal';
import { useShowActionByPreferences } from '$app/common/hooks/useShowActionByPreferences';

interface Props extends CommonProps {
  onClick?: () => void;
  to?: string;
  icon: IconType | ReactFeatherIcon;
  tooltipText?: string | null;
  setVisible?: (value: boolean) => void;
  isCommonActionSection: boolean;
  entity: Entity;
  actionKey: string;
  excludePreferences?: boolean;
}

export function EntityActionElement(props: Props) {
  const navigate = useNavigate();

  const {
    isCommonActionSection,
    onClick,
    to,
    icon,
    tooltipText,
    entity,
    actionKey,
    excludePreferences,
    setVisible,
  } = props;

  const showActionByPreferences = useShowActionByPreferences({
    commonActionsSection: isCommonActionSection,
    entity,
  });

  if (!showActionByPreferences(actionKey) && !excludePreferences) {
    return <></>;
  }

  if (isCommonActionSection) {
    return (
      <Tooltip
        width="auto"
        placement="bottom"
        message={tooltipText as string}
        withoutArrow
      >
        <div onClick={() => (to ? navigate(to) : onClick?.())}>
          <Icon element={icon} size={23.5} />
        </div>
      </Tooltip>
    );
  }

  return (
    <DropdownElement
      to={to}
      icon={<Icon element={props.icon} />}
      onClick={onClick}
      setVisible={setVisible}
    >
      {props.children}
    </DropdownElement>
  );
}
