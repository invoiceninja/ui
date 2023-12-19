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
import classNames from 'classnames';

interface Props extends CommonProps {
  to: string;
  children: ReactNode;
  external?: boolean;
  withoutDefaultStyling?: boolean;
  setBaseFont?: boolean;
}

export function Link(props: Props) {
  const accentColor = useAccentColor();

  const { prevent: preventLeavingPage } = useAtomValue(preventLeavingPageAtom);

  const preventNavigation = usePreventNavigation();

  const { withoutDefaultStyling } = props;

  const { setBaseFont } = props;

  const css: React.CSSProperties = {
    color: accentColor,
  };

  if (props.external) {
    return (
      <a
        target="_blank"
        href={props.to}
        className={classNames(
          `text-center hover:underline ${props.className}`,
          {
            'text-sm': !setBaseFont,
            'text-base': setBaseFont,
          }
        )}
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
      className={classNames(`hover:underline ${props.className}`, {
        'text-sm': !setBaseFont,
        'text-base': setBaseFont,
      })}
      style={css}
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
