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
import { EnvelopArrowRight } from './icons/EnvelopArrowRight';
import { ChevronDown } from './icons/ChevronDown';
import { ChevronUp } from './icons/ChevronUp';

interface Props extends CommonProps {
  emailRecord: EmailRecordType;
  index: number;
  withBottomBorder?: boolean;
  withEntityNavigationIcon?: boolean;
  withAllBorders?: boolean;
}

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function EmailRecord(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const colors = useColorScheme();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const {
    emailRecord,
    index,
    withBottomBorder,
    withEntityNavigationIcon,
    withAllBorders = false,
  } = props;

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
        'border rounded-md shadow-sm': withAllBorders,
      })}
      style={{
        borderColor: colors.$20,
        color: colors.$3,
        colorScheme: colors.$0,
      }}
    >
      <Div
        className={classNames(
          'flex justify-between pl-4 pr-6 py-3',
          props.className,
          {
            'cursor-pointer': Boolean(emailRecord.events.length),
          }
        )}
        theme={{ hoverColor: colors.$25 }}
        onClick={() =>
          Boolean(emailRecord.events.length) &&
          setIsCollapsed((current) => !current)
        }
      >
        <div className="flex flex-1 min-w-0 space-x-2">
          <div className="flex items-center justify-center">
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.$15 }}
            >
              <EnvelopArrowRight size="1.3rem" color={colors.$16} />
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0 pr-5">
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

            <span className="text-xs truncate" style={{ color: colors.$17 }}>
              {t('to')} {emailRecord.recipients}
            </span>
          </div>
        </div>

        {Boolean(emailRecord.events.length) && (
          <div className="flex items-center">
            {isCollapsed && <ChevronDown color={colors.$3} size="1.1rem" />}

            {!isCollapsed && <ChevronUp color={colors.$3} size="1.1rem" />}
          </div>
        )}
      </Div>

      <div
        className={classNames('pb-2', {
          hidden: isCollapsed,
        })}
      >
        {emailRecord.events.map((event, index) => (
          <div key={index} className="flex flex-1 min-w-0 px-5 text-sm">
            <div
              className={classNames(
                'flex flex-col flex-1 min-w-0 space-y-2 py-2.5 border-b border-dashed',
                {
                  'border-none': index === emailRecord.events.length - 1,
                }
              )}
              style={{ borderColor: colors.$21 }}
            >
              <div className="flex space-x-4 items-center justify-between truncate">
                <span style={{ color: colors.$17 }}>{t('recipient')}</span>

                <div className="flex flex-col items-end space-y-0.5 space-x-2">
                  <span className="text-sm">{event.recipient}</span>

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
              </div>

              <div className="flex space-x-4 items-center justify-between truncate">
                <span style={{ color: colors.$17 }}>{t('status')}</span>

                <span>{event.status}</span>
              </div>

              <div className="flex space-x-4 items-center justify-between truncate">
                <span style={{ color: colors.$17 }}>{t('date')}</span>

                <span>{date(event.date, dateFormat)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
