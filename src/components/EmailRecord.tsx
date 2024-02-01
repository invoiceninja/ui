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
import { date, endpoint } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import CommonProps from '$app/common/interfaces/common-props.interface';
import { Icon } from './icons/Icon';
import { MdTextSnippet } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { useNavigate } from 'react-router-dom';
import { Button } from './forms';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';

interface Props extends CommonProps {
  emailRecord: EmailRecordType;
  index: number;
  withBottomBorder?: boolean;
  withEntityNavigationIcon?: boolean;
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
  const navigate = useNavigate();
  const colors = useColorScheme();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const { emailRecord, index, withBottomBorder, withEntityNavigationIcon } =
    props;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    !index ? false : true
  );

  const handleReactivateEmail = (bounceId: string) => {
    request(
      'POST',
      endpoint('/api/v1/reactivate_email/:id', { id: bounceId })
    ).then(() => toast.success('reactivated_email'));
  };

  return (
    <div
      className={classNames('flex flex-col', {
        'border-b': withBottomBorder,
      })}
      style={{
        borderColor: colors.$5,
        color: colors.$3,
        colorScheme: colors.$0,
      }}
    >
      <Div
        className={classNames(
          'flex justify-between px-3 py-3',
          props.className,
          {
            'cursor-pointer': Boolean(emailRecord.events.length),
          }
        )}
        theme={{ hoverColor: colors.$4 }}
        onClick={() =>
          Boolean(emailRecord.events.length) &&
          setIsCollapsed((current) => !current)
        }
      >
        <div className="flex flex-col flex-1 min-w-0 space-y-2 pr-5">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium truncate">
              {emailRecord.subject}
            </span>

            {withEntityNavigationIcon && (
              <div>
                <Icon
                  className="cursor-pointer"
                  element={MdTextSnippet}
                  size={20}
                  onClick={() =>
                    navigate(
                      route(`/:entity/:id/edit`, {
                        id: emailRecord.entity_id,
                        entity: `${emailRecord.entity}s`,
                      })
                    )
                  }
                />
              </div>
            )}
          </div>

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
            className="flex flex-col flex-1 min-w-0 space-y-4 px-6 py-2"
            theme={{ hoverColor: colors.$4 }}
          >
            <div className="flex justify-between space-x-2">
              <span className="text-sm truncate">
                {t('status')}: {event.status}
              </span>
              <span className="text-sm">{date(event.date, dateFormat)}</span>
            </div>

            <div className="flex space-x-2 justify-between">
              <span className="text-sm truncate">{event.recipient}</span>

              {event.bounce_id && (
                <Button
                  behavior="button"
                  type="minimal"
                  onClick={() => handleReactivateEmail(event.bounce_id)}
                >
                  {t('reactivate')}
                </Button>
              )}
            </div>
          </EventDiv>
        ))}
      </div>
    </div>
  );
}
