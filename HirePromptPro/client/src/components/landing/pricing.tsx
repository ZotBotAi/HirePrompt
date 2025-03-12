import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';

export function Pricing() {
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('annual');
  
  const plans = [
    PRICING_PLANS.FREE,
    PRICING_PLANS.PROFESSIONAL,
    PRICING_PLANS.ENTERPRISE
  ];

  return (
    <div id="pricing" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:text-center">
            Pricing Plans
          </h2>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start with our free plan. Upgrade anytime as your needs grow.
          </p>
          <div className="relative self-center mt-6 rounded-lg p-0.5 flex sm:mt-8">
            <button
              type="button"
              className={`${
                frequency === 'monthly'
                  ? 'relative bg-white shadow-sm text-primary-700 border-primary-700'
                  : 'relative border border-transparent text-gray-700'
              } ml-0.5 relative w-1/2 py-2 text-sm font-medium whitespace-nowrap rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:w-auto sm:px-8`}
              onClick={() => setFrequency('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`${
                frequency === 'annual'
                  ? 'relative bg-primary-700 text-white border-transparent'
                  : 'relative border border-transparent text-gray-700'
              } ml-0.5 relative w-1/2 py-2 text-sm font-medium whitespace-nowrap rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:w-auto sm:px-8`}
              onClick={() => setFrequency('annual')}
            >
              Annual
            </button>
          </div>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{plan.name === 'Professional' ? 'For recruitment teams and HR departments.' : plan.name === 'Enterprise' ? 'For large organizations with custom needs.' : 'Perfect for individual recruiters or small teams.'}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${frequency === 'annual' ? plan.price * 0.9 : plan.price}</span>
                  {plan.price > 0 && <span className="text-base font-medium text-gray-500">/month</span>}
                </p>
                
                <Link href={plan.price === 0 ? "/signup" : "/subscribe"}>
                  <a>
                    <Button 
                      variant={plan.name === 'Professional' ? 'default' : 'outline'} 
                      className={`mt-8 block w-full py-2 text-sm font-semibold text-center ${plan.name === 'Professional' ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                    >
                      {plan.buttonText}
                    </Button>
                  </a>
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
