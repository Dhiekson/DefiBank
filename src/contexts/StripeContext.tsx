
import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Replace with your actual Stripe publishable key
// For testing purposes, we can use the Stripe test publishable key which starts with pk_test_
const stripePromise = loadStripe('pk_test_51O3EhhH2LfgXuiupUj3hbOBJO7wqSGRcCaVIj0SnSZlkbadoUmZbxsHKR5RGiLxm7pWJ2wA9m0SN3QVbK7LzWhIo004cK4oETP');

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
