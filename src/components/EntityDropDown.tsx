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
import entities from 'common/constants/entity-list';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlus, BiPlusCircle } from 'react-icons/bi';
import { MdArrowDropDown } from 'react-icons/md';
import { useClickAway } from 'react-use';

export function EntityDropDown() {
  const [t] = useTranslation();

  const ref = useRef(null);

  const [visible, setVisible] = useState(false);

  useClickAway(ref, () => {
    visible && setVisible(false);
  });

  return (
    <div ref={ref} className="flex items-center ml-10">
      <div
        className="flex items-center"
        onClick={() => setVisible((prevState) => !prevState)}
      >
        <BiPlus className="cursor-pointer text-xl md:text-2xl" />

        <MdArrowDropDown className="cursor-pointer text-xl md:text-2xl" />
      </div>

      <div
        className={classNames(
          'absolute left-28 rounded border border-gray-300',
          {
            hidden: !visible,
          }
        )}
        style={{ backgroundColor: '#595959', top: '85%' }}
      >
        <div className="flex flex-col max-h-96 overflow-auto">
          {entities.map((entity) => (
            <div
              key={entity.key}
              className="flex items-center p-2 space-x-2 hover:bg-gray-500 cursor-pointer text-white border-b border-gray-500"
            >
              <BiPlusCircle className="cursor-pointer text-md md:text-xl" />

              <span className="text-sm md:text-md">{t(entity.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
