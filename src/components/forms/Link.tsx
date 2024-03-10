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
import classNames from 'classnames';

interface Props extends CommonProps {
  to: string;
  children: ReactNode;
  external?: boolean;
  setBaseFont?: boolean;
}

export function Link(props: Props) {
  const accentColor = useAccentColor();

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
        style={css}
        rel="noreferrer"
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
    >
      {props.children}
    </RouterLink>
  );
}
