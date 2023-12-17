/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from '$app/common/hooks/useAccentColor';
import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { preventLeavingPageAtom } from '$app/App';

interface Props extends CommonProps {
  to: string;
  children: ReactNode;
  external?: boolean;
  withoutDefaultStyling?: boolean;
  withoutUnderlineStyling?: boolean;
}

export function Link(props: Props) {
  const accentColor = useAccentColor();

  const { prevent: preventLeavingPage } = useAtomValue(preventLeavingPageAtom);

  const preventNavigation = usePreventNavigation();

  const { withoutDefaultStyling, withoutUnderlineStyling } = props;

  const css: React.CSSProperties = {
    color: accentColor,
  };

  if (props.external) {
    return (
      <a
        target="_blank"
        href={props.to}
        className={`text-center text-sm hover:underline ${props.className}`}
        style={!withoutDefaultStyling ? css : undefined}
        rel="noreferrer"
        onClick={(event) => {
          if (preventLeavingPage) {
            event.preventDefault();

            preventNavigation({ url: props.to, externalLink: true });
          }
        }}
      >
        {props.children}
      </a>
    );
  }

  return (
    <RouterLink
      className={classNames(`text-sm ${props.className}`, {
        'hover:underline': !withoutUnderlineStyling,
      })}
      style={!withoutDefaultStyling ? css : undefined}
      to={props.to}
      onClick={(event) => {
        if (preventLeavingPage) {
          event.preventDefault();

          preventNavigation({ url: props.to });
        }
      }}
    >
      {props.children}
    </RouterLink>
  );
}
