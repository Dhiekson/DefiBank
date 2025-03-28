
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Home, CreditCard, Building2, Wallet, MessageSquare, UserCog, Settings, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import useMobile from '@/hooks/use-mobile';
import NavMenu from '@/components/NavMenu';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const isMobile = useMobile();
  const { user } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle scroll for hiding/showing the navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Define routes for the navigation based on authentication state
  const routes = [
    {
      path: '/',
      name: 'Início',
      icon: <Home size={16} className="mr-2" />,
      showAlways: true,
    },
    {
      path: '/wallet',
      name: 'Carteira',
      icon: <Wallet size={16} className="mr-2" />,
      requiresAuth: true,
    },
    {
      path: '/crypto',
      name: 'Criptomoedas',
      icon: <Bitcoin size={16} className="mr-2" />,
      requiresAuth: true,
    },
    {
      path: '/transactions',
      name: 'Transações',
      icon: <CreditCard size={16} className="mr-2" />,
      requiresAuth: true,
    },
    {
      path: '/account',
      name: 'Minha Conta',
      icon: <Settings size={16} className="mr-2" />,
      requiresAuth: true,
    },
    {
      path: '/support',
      name: 'Suporte',
      icon: <MessageSquare size={16} className="mr-2" />,
      showAlways: true,
    },
    {
      path: '/admin',
      name: 'Admin',
      icon: <UserCog size={16} className="mr-2" />,
      requiresAdmin: true,
    }
  ];

  // Filter routes based on authentication state
  const filteredRoutes = routes.filter(route => {
    if (route.showAlways) return true;
    if (route.requiresAuth && user) return true;
    if (route.requiresAdmin && user && user.user_metadata?.role === 'admin') return true;
    return false;
  });

  return (
    <header 
      className={`fixed w-full z-50 glass-nav transition-transform duration-300 ease-in-out ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Building2 className="h-6 w-6 text-bank-blue" />
            <span className="ml-2 text-xl font-bold text-bank-navy">DeFiBank</span>
          </Link>

          {/* Desktop Navigation */}
          <NavMenu />

          {/* User Profile */}
          <div className="hidden md:flex items-center">
            <UserProfile />
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {filteredRoutes.map((route) => (
                <Link key={route.path} to={route.path} className="block">
                  <Button 
                    variant={location.pathname === route.path ? "default" : "ghost"} 
                    className={`w-full justify-start ${location.pathname === route.path ? 'bg-bank-blue text-white' : 'text-bank-navy'}`}
                  >
                    {route.icon}
                    {route.name}
                  </Button>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <UserProfile />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
