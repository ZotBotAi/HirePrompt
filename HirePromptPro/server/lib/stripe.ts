import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Subscription features will not work properly.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
});

// Pricing tiers
const PRICING_TIERS = {
  basic: {
    name: 'Basic',
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: [
      '50 resume uploads per month',
      '5 job templates',
      'Basic question generation',
      'Email support'
    ]
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    features: [
      '200 resume uploads per month',
      '20 job templates',
      'Advanced question generation',
      'Team collaboration',
      'Priority email support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Unlimited resume uploads',
      'Unlimited job templates',
      'Custom AI training',
      'API access',
      'SSO authentication',
      'Dedicated account manager'
    ]
  }
};

async function createCustomer(email: string, name: string): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
  });
}

async function createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price: priceId,
    }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export default {
  stripe,
  PRICING_TIERS,
  createCustomer,
  createSubscription,
  getSubscription,
  cancelSubscription
};
