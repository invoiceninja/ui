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
import type { TimelineItemType } from './TimelineLayout';
import { MdCheck, MdAccessTime } from 'react-icons/md';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useColorScheme } from '$app/common/colors';

interface PropsType {
  item: TimelineItemType;
  nextItemCompleted?: boolean;
  isFirstItem?: boolean;
}

export function Timeline({ item, nextItemCompleted, isFirstItem }: PropsType) {
  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  return (
    <div
      className={classNames('group relative pl-8 xl:pl-36', {
        'pb-6': isFirstItem,
        'py-6': !isFirstItem,
      })}
    >
      <div
        className={classNames(
          'mb-1 flex flex-col items-start before:absolute before:left-4 before:h-full before:-translate-x-1/2 before:translate-y-3 before:self-start before:px-px after:absolute after:left-4 after:box-content after:h-2 after:w-2 after:-translate-x-1/2 after:translate-y-1.5 after:rounded-full after:border-4 after:border-slate-50 group-last:before:hidden xl:flex-row xl:before:left-0 xl:before:ml-[6.5rem] xl:after:left-0 xl:after:ml-[6.5rem]',
          {
            'after:bg-indigo-600': item.completed && !reactSettings.dark_mode,
            'after:bg-indigo-400': item.completed && reactSettings.dark_mode,
            'after:bg-gray-400': !item.completed,
            'before:bg-slate-300': nextItemCompleted,
            'before:border-l before:border-dashed before:border-slate-300':
              !nextItemCompleted,
          }
        )}
      >
        <div className="font-semibold" style={{ color: colors.$3 }}>
          {item.title}
          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ml-2">
            {item.completed ? (
              <MdCheck className="h-3 w-3 text-emerald-600" />
            ) : (
              <MdAccessTime className="h-3 w-3 text-amber-600" />
            )}
          </div>
        </div>
      </div>
      <div className="text-sm" style={{ color: colors.$17 }}>
        {item.description}
      </div>
      <div className="text-xs" style={{ color: colors.$17 }}>
        {item.time} {item.status}
      </div>
    </div>
  );
}
