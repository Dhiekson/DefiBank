
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the hooks
jest.mock('@/hooks/use-mobile', () => ({
  __esModule: true,
  default: () => false
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  test('renders navbar with logo', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('DeFiBank')).toBeInTheDocument();
  });

  test('hides navbar on scroll down', () => {
    renderWithProviders(<Navbar />);
    
    // Mock scroll event
    const scrollEvent = new Event('scroll');
    
    // Set window.scrollY
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    window.dispatchEvent(scrollEvent);
    
    // Get the header element and verify it has the translate-y-0 class
    const header = document.querySelector('header');
    expect(header).toHaveClass('translate-y-0');
    
    // Set window.scrollY to a larger value to simulate scrolling down
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
    window.dispatchEvent(scrollEvent);
    
    // Verify the header now has the -translate-y-full class
    expect(header).toHaveClass('-translate-y-full');
  });
});
