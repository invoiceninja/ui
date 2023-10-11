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
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import classNames from 'classnames';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { styled } from 'styled-components';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import CommonProps from '$app/common/interfaces/common-props.interface';

interface Props extends CommonProps {
  emailRecord: EmailRecordType;
  index: number;
  withBottomBorder?: boolean;
}

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const EventDiv = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function EmailRecord(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const { emailRecord, index, withBottomBorder } = props;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    !index ? false : true
  );

  return (
    <div
      className={classNames('flex flex-col', {
        'border-b': withBottomBorder,
      })}
      style={{ borderColor: colors.$5 }}
    >
      <Div
        className={classNames(
          'flex justify-between px-3 py-3',
          props.className,
          {
            'cursor-pointer': Boolean(emailRecord.events.length),
          }
        )}
        theme={{ hoverColor: colors.$2 }}
        onClick={() =>
          Boolean(emailRecord.events.length) &&
          setIsCollapsed((current) => !current)
        }
      >
        <div className="flex flex-col flex-1 min-w-0 space-y-2 pr-5">
          <span className="text-sm font-medium truncate">
            {emailRecord.subject}
          </span>

          <span className="text-sm truncate">
            {t('to')}: {emailRecord.recipients}
          </span>
        </div>

        {Boolean(emailRecord.events.length) && (
          <div className="flex items-center">
            {isCollapsed && <ChevronDown />}

            {!isCollapsed && <ChevronUp />}
          </div>
        )}
      </Div>

      <div
        className={classNames({
          hidden: isCollapsed,
        })}
      >
        {emailRecord.events.map((event, index) => (
          <EventDiv
            key={index}
            className="flex flex-col flex-1 min-w-0 space-y-2 px-6 py-2"
            theme={{ hoverColor: colors.$2 }}
          >
            <div className="flex justify-between space-x-2">
              <span className="text-sm font-medium">{event.recipient}</span>
              <span className="text-sm">{date(event.date, dateFormat)}</span>
            </div>

            <div className="flex justify-between truncate">
              <span className="text-sm truncate">
                {t('status')}: {event.status}
              </span>
              <span className="text-sm">{date(event.date, 'h:mm:ss A')}</span>
            </div>
          </EventDiv>
        ))}
      </div>
    </div>
  );
}
