/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from 'common/interfaces/task';
import { atom } from 'jotai';

export const taskAtom = atom<Task | undefined>(undefined);

export const sliderIntervalAtom = atom<
  ReturnType<typeof setInterval> | undefined
>(undefined);

export const mainIntervalAtom = atom<
  ReturnType<typeof setInterval> | undefined
>(undefined);
