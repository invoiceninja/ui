import classNames from 'classnames';
import { useState, useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';
import { Icon } from './icons/Icon';
import { MdClose } from 'react-icons/md';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export function Feedback() {
  const ratings = Array.from({ length: 11 }, (_, i) => i);

  const boxRef = useRef<HTMLDivElement>(null);

  const reactSettings = useReactSettings();

  const [isVisible, setIsVisible] = useState<boolean>(false);

  useClickAway(boxRef, () => setIsVisible(false));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      ref={boxRef}
      className={classNames(
        'fixed bottom-0 left-0 right-0 z-50 w-full bg-white shadow-lg transform transition-transform duration-500 ease-in-out p-4',
        {
          'translate-y-0': isVisible,
          'translate-y-full': !isVisible,
        }
      )}
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        onClick={() => setIsVisible(false)}
      >
        <Icon element={MdClose} size={25} style={{ color: '#000' }} />
      </button>

      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-xl font-medium text-gray-900">
          How would you rate your experience?
        </h3>

        <div className="flex items-center justify-center space-x-3">
          {ratings.map((rating) => (
            <button
              key={rating}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="text-gray-900">{rating}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
