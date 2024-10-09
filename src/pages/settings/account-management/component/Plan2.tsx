/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Card } from '$app/components/cards';
import { Button, SelectField } from '$app/components/forms';
import { Check, Plus, Trash2 } from 'react-feather';
import mc from 'public/gateway-card-images/mastercard.png';
import visa from 'public/gateway-card-images/visa.png';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import Toggle from '$app/components/forms/Toggle';

export function Plan2() {
  const accentColor = useAccentColor();
  const colors = useColorScheme();

  const [popupVisible, setPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <div className="px-7 py-3 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Your Plan</h4>
            <button
              style={{ color: accentColor }}
              className="text-sm hover:underline"
              type="button"
              onClick={() => setPopupVisible(true)}
            >
              Compare plans
            </button>
          </div>

          <Free />
          <Trial />
          <Pro />
          <Enterprise />
          <PremiumBusinessPlus />

          <div
            className="rounded p-4 flex flex-col 2xl:flex-row justify-between items-center space-y-5 2xl:space-y-0"
            style={{ backgroundColor: colors.$2 }}
          >
            <div className="flex flex-col space-y-2">
              <p className="font-semibold text-center 2xl:text-left">
                Increase your efficiency with these features
              </p>

              <div className="flex flex-col 2xl:flex-row items-center space-x-2 text-sm">
                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Developer Direct Concierge</span>
                </p>

                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Priority Direct Support</span>
                </p>

                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Feature Request Priority</span>
                </p>
              </div>
            </div>

            <Button behavior="button" onClick={() => setPopupVisible(true)}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-7 py-3 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Payment method</h4>
            <NewCreditCard />
          </div>

          <div className="flex flex-wrap gap-3">
            <CreditCard
              name="Visa"
              card={visa}
              onDelete={() => setDeletePopupVisible(true)}
              current
            />

            <CreditCard
              name="Mastercard"
              card={mc}
              onDelete={() => setDeletePopupVisible(true)}
              current={false}
            />
          </div>
        </div>
      </Card>

      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} />

      <DeleteCreditCard
        visible={deletePopupVisible}
        onClose={() => setDeletePopupVisible(false)}
      />
    </div>
  );
}

function Free() {
  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <p className="font-semibold">Free</p>

      <p>
        <b>$0 /</b> year
      </p>
    </div>
  );
}

function Trial() {
  const accentColor = useAccentColor();
  const scheme = useColorScheme();

  return (
    <div
      className="border border-l-8 rounded p-4 flex flex-col space-y-4"
      style={{ borderColor: accentColor }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">Enterprise</p>

        <p>
          Free trial, then<b> $160 /</b> year
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p>13 days left</p>
        <p>14 days trial</p>
      </div>

      <div
        className="w-full rounded-full h-2.5"
        style={{ backgroundColor: scheme.$2 }}
      >
        <div
          className="h-2.5 rounded-full"
          style={{ width: '90%', background: accentColor }}
        ></div>
      </div>
    </div>
  );
}

function Enterprise() {
  const accentColor = useAccentColor();

  return (
    <div
      className="border border-l-8 rounded p-4 flex flex-col space-y-4"
      style={{ borderColor: accentColor }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">Enterprise</p>

        <p>
          <b>$160 /</b> year
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p>
          Expires on <b>31-Dec-2025</b>
        </p>
      </div>
    </div>
  );
}

function Pro() {
  return (
    <div
      className="border border-l-8 rounded p-4 flex flex-col space-y-4"
      style={{ borderColor: '#5EC16A' }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">Ninja Pro</p>

        <p>
          <b>$120 /</b> year
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p>
          Expires on <b>31-Dec-2025</b>
        </p>
      </div>
    </div>
  );
}

function PremiumBusinessPlus() {
  return (
    <div
      className="border border-l-8 rounded p-4 flex flex-col space-y-4"
      style={{ borderColor: '#FFCB00' }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">Premium Business+</p>

        <p>
          <b>$160 /</b> year
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p>
          Expires on <b>31-Dec-2025</b>
        </p>
      </div>
    </div>
  );
}

interface CreditCardProps {
  name: string;
  card: string;
  current: boolean;
  onDelete: () => void;
}

function CreditCard({ name, card, current, onDelete }: CreditCardProps) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();

  return (
    <div
      className="flex flex-col w-72 p-4 rounded border"
      style={{ borderColor: current ? accentColor : colors.$11 }}
    >
      <div className="flex justify-between items-center">
        <img src={card} alt={name} className="h-10" />

        <button
          type="button"
          className="bg-white p-1 rounded-full cursor-pointer"
          onClick={onDelete}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-x-1 flex items-center my-4 font-bold">
        <span>****</span>
        <span>****</span>
        <span>****</span>
        <span>3456</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p>Valid through</p>
        <p>12/26</p>
      </div>
    </div>
  );
}

interface PopupProps {
  visible: boolean;
  onClose: () => void;
}

function NewCreditCard() {
  const accentColor = useAccentColor();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <button
        type="button"
        style={{ color: accentColor }}
        className="text-sm hover:underline flex items-center space-x-1"
        onClick={() => setIsVisible(true)}
      >
        <Plus size={18} /> <span>Add new card</span>
      </button>

      <Modal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        title="Add new card"
      >
        <div className="border border-dashed p-10 text-center">
          This is placeholder for Stripe widget.
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="secondary"
            behavior="button"
            onClick={() => setIsVisible(false)}
          >
            Cancel
          </Button>

          <Button
            type="primary"
            behavior="button"
            onClick={() => setIsVisible(false)}
          >
            Save card
          </Button>
        </div>
      </Modal>
    </>
  );
}

interface DeleteCreditCardProps {
  visible: boolean;
  onClose: () => void;
}

function DeleteCreditCard({ visible, onClose }: DeleteCreditCardProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <div className="px-5 text-center space-y-4 mb-4">
        <h4 className="font-semibold text-xl">
          Are you sure you want to delete the credit card?
        </h4>

        <p>You can add a card again at any time.</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="secondary" behavior="button" onClick={() => onClose()}>
          Cancel
        </Button>

        <Button type="primary" behavior="button" onClick={() => onClose()}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

function Popup({ visible, onClose }: PopupProps) {
  const [pricing, setPricing] = useState<'monthly' | 'annually'>('monthly');

  const accentColor = useAccentColor();
  const colors = useColorScheme();

  return (
    <Modal visible={visible} onClose={onClose} size="large">
      <div className="-mt-16 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold">More than invoicing</h1>
          <h2 className="text-2xl mt-2">Simple Pricing. Advanced Features.</h2>
        </div>

        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <span>Monthly</span>

            <Toggle
              checked={pricing === 'annually'}
              onValueChange={() =>
                setPricing((c) => (c === 'monthly' ? 'annually' : 'monthly'))
              }
            />
            <span>Annual</span>
          </div>
        </div>

        <div className="flex flex-col 2xl:flex-row gap-4 mt-6">
          <div className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8">
            <div className="h-72 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-2xl">Free!</h3>
                <p className="my-4">Yes, it’s really free 🙂</p>

                <div>
                  <div className="flex items-end space-x-2">
                    <h2 className="text-3xl font-semibold">$0</h2>
                    <span>Per year</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="border py-3 px-4 rounded"
                style={{ color: accentColor }}
              >
                Downgrade Plan
              </button>
            </div>
          </div>

          <div
            className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8"
            style={{ borderColor: '#5EC16A' }}
          >
            <div className="h-72 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-2xl">Ninja Pro</h3>
                <p className="my-4">Pay annually for 10 months + 2 free!</p>

                <div>
                  <div className="flex items-end space-x-2">
                    <h2 className="text-3xl font-semibold">$120</h2>
                    <span>Per year</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="border py-3 px-4 rounded"
                style={{ backgroundColor: colors.$5 }}
                disabled
              >
                Current plan
              </button>
            </div>
          </div>

          <div
            className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8"
            style={{ borderColor: accentColor }}
          >
            <div className="h-72 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-2xl">Enterprise</h3>
                <p className="my-4">Pay annually for 10 months + 2 free!</p>

                <div>
                  <div className="flex items-end space-x-2">
                    <h2 className="text-3xl font-semibold">$160</h2>
                    <span>Per year</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <SelectField label="Plan selected">
                  <option value="1">1-2 users</option>
                </SelectField>

                <button
                  type="button"
                  className="border py-3 px-4 rounded"
                  style={{ backgroundColor: accentColor, color: colors.$1 }}
                  disabled
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          <div
            className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8"
            style={{ borderColor: '#FFCB00' }}
          >
            <div className="h-72 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-2xl">Premium Business+ </h3>
                <p className="my-4">
                  Pro + Enterprise + Premium Business Concierge
                </p>

                <div>
                  <h2 className="text-3xl font-semibold">
                    Pricing? <br /> Let&apos;s talk!
                  </h2>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  className="border py-3 px-4 rounded"
                  style={{ backgroundColor: accentColor, color: colors.$1 }}
                  disabled
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
