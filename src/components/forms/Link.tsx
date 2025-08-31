/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CommonProps from '../../common/interfaces/common-props.interface';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { preventLeavingPageAtom } from '$app/common/hooks/useAddPreventNavigationEvents';
import { ExternalLink } from '../icons/ExternalLink';

interface Props extends CommonProps {
  to: string;
  children: ReactNode;
  external?: boolean;
  withoutDefaultStyling?: boolean;
  setBaseFont?: boolean;
  disableHoverUnderline?: boolean;
  withoutExternalIcon?: boolean;
  withoutAdjustedHref?: boolean;
}

export function Link(props: Props) {
  const { prevent: preventLeavingPage } = useAtomValue(preventLeavingPageAtom);

  const preventNavigation = usePreventNavigation();

  const {
    withoutDefaultStyling,
    setBaseFont,
    disableHoverUnderline,
    withoutExternalIcon = false,
  } = props;

  const css: React.CSSProperties = {
    color: '#0062FF',
    ...props.style,
  };

  const getAdjustedHref = () => {
    return props.to.startsWith('http://') || props.to.startsWith('https://')
      ? props.to
      : `https://${props.to}`;
  };

  if (props.external) {
    return (
      <div
        className={classNames('flex space-x-2 items-center', props.className)}
      >
        {!withoutExternalIcon && (
          <div>
            <ExternalLink size="1rem" color="#0062FF" />
          </div>
        )}

        <a
          target="_blank"
          href={props.withoutAdjustedHref ? props.to : getAdjustedHref()}
          className={classNames('text-center', {
            'text-sm': !setBaseFont,
            'text-base': setBaseFont,
            'hover:underline': !withoutDefaultStyling && !disableHoverUnderline,
          })}
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
      </div>
    );
  }

  return (
    <RouterLink
      className={classNames(`${props.className}`, {
        'text-sm': !setBaseFont,
        'text-base': setBaseFont,
        'hover:underline': !withoutDefaultStyling && !disableHoverUnderline,
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
