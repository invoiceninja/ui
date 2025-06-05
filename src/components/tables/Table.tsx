/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';

interface Props extends CommonProps {
  withoutPadding?: boolean;
  withoutBottomBorder?: boolean;
  withoutTopBorder?: boolean;
  withoutLeftBorder?: boolean;
  withoutRightBorder?: boolean;
  isDataLoading?: boolean;
  resizable?: string;
  withoutBorder?: boolean;
}

export function Table(props: Props) {
  const colors = useColorScheme();

  return (
    <div
      className={classNames('flex flex-col', {
        'mt-2': !props.withoutPadding,
      })}
    >
      <div
        className={classNames('align-middle inline-block min-w-full', {
          'py-1.5': !props.withoutPadding,
        })}
      >
        <div
          className={classNames(
            'overflow-hidden border rounded-md border-b border-t',
            {
              'border-b-0': props.withoutBottomBorder,
              'border-t-0': props.withoutTopBorder,
              'border-l-0': props.withoutLeftBorder,
              'border-r-0': props.withoutRightBorder,
            }
          )}
          style={{
            backgroundColor: colors.$1,
            color: colors.$3,
            borderColor: colors.$24,
          }}
        >
          <div
            className={`overflow-auto min-w-full rounded-md shadow-sm ${props.className}`}
            style={{
              ...props.style,
              height: props.style?.height || 'auto',
            }}
          >
            <table
              className={classNames({
                'min-w-full table-auto': !props.resizable,
                'min-w-full table-fixed': props.resizable,
              })}
            >
              {props.children}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
