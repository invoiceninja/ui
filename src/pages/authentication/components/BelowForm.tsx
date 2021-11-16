/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from "react-i18next";
import { ShieldCheck } from "../../../components/icons/ShieldCheck";
import { Smartphone } from "../../../components/icons/Smartphone";

export function BelowForm() {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500"></span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <a
            href="https://status.invoiceninja.com/"
            target="_blank"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Check Status</span>
            <div className="flex items-center">
              <ShieldCheck />
              <span className="ml-1">Check status</span>
            </div>
          </a>
        </div>

        <div>
          <a
            href="https://www.invoiceninja.com/mobile/"
            target="_blank"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Applications</span>
            <div className="flex items-center">
              <Smartphone />
              <span className="ml-1">Applications</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
