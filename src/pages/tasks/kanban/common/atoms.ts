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

export const currentTaskAtom = atom<Task | undefined>(undefined);
export const currentTaskIdAtom = atom<string | undefined>(undefined);
export const isKanbanSliderVisibleAtom = atom(false);
