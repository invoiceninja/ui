/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { useLogo } from 'common/hooks/useLogo';
import { ColorPicker } from 'components/forms/ColorPicker';
import { ArrowLeft } from 'react-feather';

export function Designer() {
  const logo = useLogo();

  return (
    <div className="flex">
      <div className="h-screen w-1/3 bg-gray-100">
        <div className="inline-flex items-center p-6">
          <Link className="inline-flex items-center space-x-1" to="/settings">
            <ArrowLeft size={16} />
            <span>Back to settings</span>
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-gray-200">
          <div className="px-6 py-4">
            <h4 className="uppercase font-semibold">Company logo</h4>
            <p className="text-xs">Change company logo and adjust the size</p>

            <div className="flex flex-col space-y-2 my-4">
              <small className="font-medium">Logo</small>

              <div className="grid grid-cols-12 lg:gap-4 space-y-4 lg:space-y-0">
                <div className="bg-gray-200 col-span-12 lg:col-span-5 rounded-lg p-6">
                  <img src={logo} />
                </div>
              </div>

              <label
                htmlFor="slider"
                className="inline-flex items-center space-x-2"
              >
                <input type="range" min="1" max="100" value="29" id="slider" />
                <span className="text-sm">29%</span>
              </label>
            </div>
          </div>

          <div className="px-6 py-4">
            <h4 className="uppercase font-semibold">Colors</h4>
            <p className="text-xs">
              Adjust primary and secondary color to match your brand
            </p>

            <div className="flex flex-col space-y-2 my-4">
              <small className="font-medium">Primary color</small>

              <ColorPicker />
            </div>

            <div className="flex flex-col space-y-2 my-4">
              <small className="font-medium">Secondary color</small>

              <ColorPicker />
            </div>
          </div>
        </div>
      </div>
      <div className="h-screen w-full bg-gray-300 flex justify-center overflow-y-auto p-10">
        <div
          className="bg-white p-10 rounded"
          style={{ minWidth: 960, minHeight: 1280 }}
        >
          Preview
        </div>
      </div>
    </div>
  );
}
