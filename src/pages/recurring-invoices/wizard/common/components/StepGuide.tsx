/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Slider } from '$app/components/cards/Slider';
import { Button } from '$app/components/forms';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';

export type GuideTopic = 'schedule' | 'schedule_running' | 'payment' | 'send';

interface GuideEntry {
  term?: string;
  text: string;
}

interface GuideSection {
  heading: string;
  entries: GuideEntry[];
  example?: string;
}

const GUIDES: Record<GuideTopic, { title: string; sections: GuideSection[] }> =
  {
    schedule: {
      title: 'frequency_id',
      sections: [
        {
          heading: 'frequency',
          entries: [{ text: 'guide_frequency' }],
          example: 'guide_month_end_tip',
        },
        {
          heading: 'when_do_you_want_this_to_start',
          entries: [{ text: 'guide_first_invoice' }],
          example: 'guide_start_example',
        },
        {
          heading: 'when_should_it_stop',
          entries: [{ text: 'guide_stop' }],
          example: 'guide_stop_example',
        },
        {
          heading: 'guide_changes_heading',
          entries: [{ text: 'guide_changes' }],
        },
      ],
    },
    schedule_running: {
      title: 'frequency_id',
      sections: [
        {
          heading: 'frequency',
          entries: [{ text: 'guide_frequency' }],
          example: 'guide_month_end_tip',
        },
        {
          heading: 'next_send_date',
          entries: [{ text: 'next_send_date_help' }],
        },
        {
          heading: 'when_should_it_stop',
          entries: [{ text: 'guide_stop_running' }],
        },
        {
          heading: 'guide_changes_heading',
          entries: [{ text: 'guide_changes' }],
        },
      ],
    },
    payment: {
      title: 'payment_terms',
      sections: [
        {
          heading: 'due_date',
          entries: [
            { text: 'guide_due_date' },
            { term: 'use_payment_terms', text: 'guide_use_payment_terms' },
            { term: 'day_of_the_month', text: 'guide_day_of_the_month' },
          ],
          example: 'guide_day_of_the_month_example',
        },
        {
          heading: 'auto_bill',
          entries: [
            { text: 'guide_auto_bill' },
            { text: 'guide_auto_bill_date' },
          ],
        },
      ],
    },
    send: {
      title: 'review_and_send',
      sections: [
        {
          heading: 'guide_finish_heading',
          entries: [
            { term: 'send_now', text: 'guide_send_now' },
            { term: 'activate_recurring_invoice', text: 'guide_activate' },
            { term: 'save', text: 'guide_save' },
          ],
          example: 'guide_which_button',
        },
      ],
    },
  };

interface Props {
  topic: GuideTopic | undefined;
}

export function StepGuide({ topic }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const [open, setOpen] = useState(false);

  if (!topic) {
    return null;
  }

  const guide = GUIDES[topic];

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={t('how_it_works')}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm p-2 -m-2"
        style={{ color: accentColor, fontWeight: 500 }}
      >
        <MdInfoOutline aria-hidden fontSize={16} />

        <span className="hidden sm:inline">{t('how_it_works')}</span>
      </button>

      <Slider
        visible={open}
        onClose={() => setOpen(false)}
        title={t(guide.title)}
        size="regular"
        withoutDivider
        actionChildren={
          <Button
            type="secondary"
            behavior="button"
            variant="block"
            onClick={() => setOpen(false)}
          >
            {t('close')}
          </Button>
        }
      >
        <div tabIndex={0} className="px-4 sm:px-6 py-5 focus:outline-none">
          <Dialog.Title as="h2" className="sr-only">
            {t(guide.title)}
          </Dialog.Title>

          <div className="space-y-7">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h3
                  className="text-sm mb-2"
                  style={{ color: colors.$3, fontWeight: 600 }}
                >
                  {t(section.heading)}
                </h3>

                <div className="space-y-2.5">
                  {section.entries.map((entry) => (
                    <p
                      key={entry.text}
                      className="text-sm leading-6"
                      style={{ color: colors.$22 }}
                    >
                      {entry.term ? (
                        <span
                          className="block"
                          style={{ color: colors.$3, fontWeight: 500 }}
                        >
                          {t(entry.term)}
                        </span>
                      ) : null}

                      {t(entry.text)}
                    </p>
                  ))}
                </div>

                {section.example ? (
                  <p
                    className="text-sm leading-6 mt-3 px-3.5 py-2.5"
                    style={{
                      color: colors.$3,
                      backgroundColor: colors.$25,
                      borderRadius: '0.375rem',
                    }}
                  >
                    {t(section.example)}
                  </p>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </Slider>
    </>
  );
}
