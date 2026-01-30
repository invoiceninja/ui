/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Config, driver, DriveStep } from 'driver.js';
import { useEffect } from 'react';
import 'driver.js/dist/driver.css';

export interface DriverTourProps {
  steps: DriveStep[];
  eventName?: string;
  options?: Config;
  delay?: number;
  show?: boolean;
}

export function useDriverTour({
  steps,
  eventName,
  options,
  delay,
  show,
}: DriverTourProps) {
  useEffect(() => {
    if (show === false) {
      return;
    }

    const handler = () => {
      setTimeout(() => {
        const $driver = driver({
          ...options,
          steps,
        });

        $driver.drive();
      }, delay ?? 0);
    };

    if (!eventName) {
      handler();
     
      return;
    }

    window.addEventListener(eventName, handler);

    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, []);
}
