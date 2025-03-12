export type ButtonVariantType = 'link' | 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost';

export interface PricingPlan {
  name: string;
  price: number;
  features: string[];
  buttonText: string;
  buttonVariant: ButtonVariantType;
  recommended: boolean;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  FREE: {
    name: 'Starter',
    price: 0,
    features: [
      '5 resume analyses per month',
      'Basic question types',
      'Email support'
    ],
    buttonText: 'Sign up for free',
    buttonVariant: 'outline',
    recommended: false
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 49,
    features: [
      '50 resume analyses per month',
      'Advanced question types',
      'Team collaboration',
      'Priority support'
    ],
    buttonText: 'Select plan',
    buttonVariant: 'default',
    recommended: true
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 199,
    features: [
      'Unlimited resume analyses',
      'Custom question templates',
      'API access',
      'Dedicated account manager',
      'SSO & advanced security'
    ],
    buttonText: 'Contact sales',
    buttonVariant: 'secondary',
    recommended: false
  }
};
