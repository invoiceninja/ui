import { Default } from '$app/components/layouts/Default';
import { Card } from '$app/components/cards';
import { Button, InputField, Link } from '$app/components/forms';
import {
  Zap,
  Star,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
} from 'react-feather';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { routeWithOrigin } from '$app/common/helpers/route';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';

const BETA_BENEFITS = [
  'Early access to all new features',
  'Direct communication with our team',
  'Free during beta testing period',
  'Shape the product roadmap with your feedback',
];

export default function Beta() {
  return (
    <Default
      title="Join Docu Ninja Beta"
      breadcrumbs={[{ name: 'Beta', href: '/beta' }]}
    >
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="max-w-2xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="w-40 h-10 rounded mx-auto mb-4 flex items-center justify-center">
              <img
                src="https://docuninja.co/wp-content/uploads/2025/03/logo.svg"
                alt="Docu Ninja Logo"
                className="size-32 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold mb-3">Join Docu Ninja Beta</h1>
            <p className="text-lg opacity-80 max-w-lg mx-auto">
              Get early access to new document automation features.
            </p>
          </div>

          {/* Benefits Grid */}
          <Card
            className="shadow mb-6"
            title={
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Exclusive Beta Benefits</span>
              </div>
            }
            withoutHeaderBorder
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NonClickableElement className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Early Access</h3>
                  <p className="text-sm opacity-70">
                    Try new features before anyone else
                  </p>
                </div>
              </NonClickableElement>

              <NonClickableElement className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Priority Support</h3>
                  <p className="text-sm opacity-70">
                    Direct line to our product team
                  </p>
                </div>
              </NonClickableElement>

              <NonClickableElement className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Shape the Roadmap</h3>
                  <p className="text-sm opacity-70">
                    Your feedback drives our development
                  </p>
                </div>
              </NonClickableElement>
            </div>
          </Card>

          <Card
            className="shadow mb-6"
            title={
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>What You Get</span>
              </div>
            }
            withoutHeaderBorder
          >
            <div className="space-y-3">
              {[
                'Unlimited access to all beta features',
                'Direct communication channel with developers',
                'First look at upcoming releases',
                'Exclusive beta tester resources & guides',
              ].map((item, index) => (
                <NonClickableElement key={index}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                </NonClickableElement>
              ))}
            </div>
          </Card>

          <div className="text-center">
            <Join />
            <p className="mt-4 text-sm opacity-60">Free during beta testing.</p>
          </div>
        </div>
      </div>
    </Default>
  );
}

function Join() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const [code, setCode] = useState('');

  const navigate = useNavigate();
  const account = useCurrentAccount();

  const isPro = account?.plan === 'pro' || account?.plan === 'enterprise';

  const join = () => {
    setIsSubmitting(true);

    request(
      'POST',
      endpoint('/api/client/account_management/v2/docuninja/beta'),
      { code }
    )
      .then((res) => {
        setIsSubmitting(false);
        setIsModalOpen(false);

        toast.success(
          `You've joined the beta. We appreciate your partnership in refining this experience. Redirecting...`
        );

        setTimeout(() => {
         window.location.href = routeWithOrigin('/docuninja');
        }, 3000);
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          setIsSubmitting(false);
          setIsEligible(false);
        } else {
          setIsSubmitting(false);

          toast.error();
        }
      });
  };

  if (!isPro) {
    return (
      <div className="text-center">
        <p className="text-sm opacity-70 mb-3">
          A Pro or Enterprise plan is required to join the Docu Ninja Beta.
        </p>
        <Link to="/settings/account_management">
          <Button type="primary" behavior="button">
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Button
        type="primary"
        behavior="button"
        onClick={() => setIsModalOpen(true)}
      >
        <Send className="w-5 h-5 mr-2" />
        Join beta
      </Button>

      <Modal
        title="Join Docu Ninja Beta"
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="small"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-40 h-10 bg-white rounded mx-auto mb-4 flex items-center justify-center">
              <img
                src="https://docuninja.co/wp-content/uploads/2025/03/logo.svg"
                alt="Docu Ninja Logo"
                className="size-32 object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Confirm Beta Enrollment
            </h3>
            <p className="text-sm opacity-70">
              You're about to join the Docu Ninja Beta program. You'll get early
              access to new features and can provide feedback to help shape the
              product.
            </p>
          </div>

          <InputField
            label="Beta code"
            placeholder="Enter beta invite code"
            onValueChange={setCode}
          />

          <p className="text-sm opacity-70">
            If you don't have a beta invite code, please contact us at{' '}
            <a href="mailto:contact@docuninja.com" className="underline">
              contact@docuninja.com
            </a>{' '}
            for more information.
          </p>

          <div className="flex justify-end">
            <Button
              type="primary"
              behavior="button"
              onClick={join}
              disabled={isSubmitting}
              disableWithoutIcon
            >
              {isSubmitting ? 'Joining, please wait...' : 'Continue'}
            </Button>
          </div>
        </div>

        {!isEligible ? (
          <p className="text-red-500">
            Your account doesn’t meet the criteria for this beta yet or you
            provided wrong invite code.
          </p>
        ) : null}
      </Modal>
    </>
  );
}
