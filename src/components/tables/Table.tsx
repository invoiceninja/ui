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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  withoutPadding?: boolean;
  withoutBottomBorder?: boolean;
  onVerticalOverflowChange?: (overflow: boolean) => void;
}

export function Table(props: Props) {
  const [t] = useTranslation();
  const { onVerticalOverflowChange } = props;

  const [tableParentHeight, setTableParentHeight] = useState<number>();
  const [tableHeight, setTableHeight] = useState<number>();
  const [manualTableHeight, setManualTableHeight] = useState<
    number | string | undefined
  >(props.style?.height);
  const [numberOfCells, setNumberOfCells] = useState<number>(0);
  const [isVerticallyOverflow, setIsVerticallyOverflow] =
    useState<boolean>(true);

  const handleTableParentHeight = (element: HTMLDivElement | null) => {
    if (element && onVerticalOverflowChange) {
      setTableParentHeight(element.clientHeight);
    }
  };

  const handleTableHeight = (element: HTMLTableElement | null) => {
    if (element && onVerticalOverflowChange) {
      if (element.querySelectorAll('tbody > tr').length > 0) {
        if (
          element.querySelectorAll('tbody > tr > td')[0].textContent ===
          t('no_records_found')
        ) {
          setNumberOfCells(-1);
        } else {
          setNumberOfCells(
            element.querySelectorAll('tbody > tr > td').length ?? 0
          );
        }
      }

      setTableHeight(element.clientHeight);
    }
  };

  useEffect(() => {
    if (
      typeof tableHeight === 'number' &&
      typeof tableParentHeight === 'number' &&
      numberOfCells > 1 &&
      onVerticalOverflowChange
    ) {
      if (tableHeight > tableParentHeight) {
        onVerticalOverflowChange?.(true);
        setIsVerticallyOverflow(true);
      } else {
        onVerticalOverflowChange?.(false);
        setIsVerticallyOverflow(false);
      }
    }
  }, [tableHeight, tableParentHeight]);

  useEffect(() => {
    if (props.style?.height && onVerticalOverflowChange) {
      setManualTableHeight(props.style?.height);
    }
  }, [props.style?.height]);

  useEffect(() => {
    if (isVerticallyOverflow && numberOfCells === -1) {
      setManualTableHeight('auto');
    }

    if (
      !isVerticallyOverflow &&
      numberOfCells > 1 &&
      onVerticalOverflowChange
    ) {
      setManualTableHeight('auto');
    }
  }, [isVerticallyOverflow, numberOfCells]);

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
            'overflow-hidden border border-gray-200 dark:border-transparent rounded border-b border-t',
            {
              'border-b-0': props.withoutBottomBorder,
            }
          )}
        >
          <div
            ref={handleTableParentHeight}
            className={`overflow-y-auto ${props.className}`}
            style={{
              ...props.style,
              height: manualTableHeight,
            }}
          >
            <table
              ref={handleTableHeight}
              className="min-w-full table-auto divide-y divide-gray-200"
            >
              {props.children}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
