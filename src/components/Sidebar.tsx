
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Wallet, 
  CreditCard, 
  Coins, 
  BarChart3, 
  Settings, 
  ChevronRight, 
  Home,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { connected, account, provider, connectWallet } = useWeb3();
  const { toast } = useToast();

  const navItems = [
    {
      icon: <Wallet size={20} />,
      label: 'Carteira',
      href: '/dashboard/wallet',
      authRequired: true
    },
    {
      icon: <CreditCard size={20} />,
      label: 'Transações',
      href: '/dashboard/transactions',
      authRequired: true
    },
    {
      icon: <Coins size={20} />,
      label: 'Criptomoedas',
      href: '/dashboard/crypto',
      authRequired: true
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Portfólio',
      href: '/dashboard/portfolio',
      authRequired: true
    },
    {
      icon: <Settings size={20} />,
      label: 'Configurações',
      href: '/dashboard/settings',
      authRequired: true
    }
  ];

  const handleConnectWallet = async () => {
    if (!connected) {
      const success = await connectWallet('metamask');
      if (!success) {
        toast({
          title: "Carteira não conectada",
          description: "Tente novamente ou utilize outra opção de carteira.",
          variant: "destructive"
        });
      }
    }
  };

  const formatWalletAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <aside className="hidden md:block w-64 border-r border-border bg-card h-[calc(100vh-64px)] fixed pt-4">
      <div className="px-4 py-2">
        {connected && account ? (
          <div className="mb-6 p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Carteira Conectada</div>
            <div className="font-medium">{formatWalletAddress(account)}</div>
            <div className="text-xs text-muted-foreground mt-1 capitalize">{provider}</div>
          </div>
        ) : (
          <Button 
            className="w-full mb-6"
            variant="outline"
            onClick={handleConnectWallet}
          >
            Conectar Carteira
          </Button>
        )}
      </div>
      
      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            <ChevronRight size={16} className="ml-auto" />
          </NavLink>
        ))}
      </nav>
      
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Home size={20} />
          <span>Página Inicial</span>
        </NavLink>
        
        <NavLink
          to="/support"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <HelpCircle size={20} />
          <span>Ajuda & Suporte</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
