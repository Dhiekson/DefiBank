
import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

interface StripeProviderProps {
  children: ReactNode;
}

const StripeContext = createContext(null);

export const useStripe = () => useContext(StripeContext);

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
