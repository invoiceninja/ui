/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Icon } from '$app/components/icons/Icon';
import classNames from 'classnames';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowRight } from 'react-icons/md';

interface Props {
  viewedAll: boolean;
  setViewedAll: Dispatch<SetStateAction<boolean>>;
}

export function ViewAll(props: Props) {
  const [t] = useTranslation();

  const { viewedAll, setViewedAll } = props;

  return (
    <>
      <div
        className={classNames(
          'z-10 absolute w-[calc(100%-26px)] h-[4.5rem] bottom-11 left-0 bg-gradient-to-t from-[#00000027] to-transparent dark:bg-transparent dark:bg-gradient',
          {
            hidden: viewedAll,
          }
        )}
      ></div>

      <div
        className={classNames(
          'flex items-center justify-end pt-2 pr-3 text-[#2F7DC3] opacity-80 hover:opacity-100 cursor-pointer',
          {
            hidden: viewedAll,
          }
        )}
        onClick={() => setViewedAll(true)}
      >
        <span className="mt-1">{`${t('view_all')}`}</span>
        <Icon element={MdKeyboardArrowRight} size={25} />
      </div>
    </>
  );
}
