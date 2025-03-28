
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  CreditCard,
  Wallet,
  Settings,
  Bitcoin,
  Home,
  User,
  BarChart,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NavMenu: React.FC = () => {
  const { user } = useAuth();

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Home className="mr-2 h-4 w-4" />
              Início
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {user && (
          <>
            <NavigationMenuItem>
              <Link to="/wallet">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Carteira
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Bitcoin className="mr-2 h-4 w-4" />
                Criptomoedas
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/crypto"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center">
                          <Bitcoin className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Mercado Cripto</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Ver preços atuais e negociar criptomoedas
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/crypto-portfolio"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 mr-2" />
                          <div className="text-sm font-medium leading-none">Portfólio</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Acompanhe seu portfólio de criptomoedas
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/transactions">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Transações
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/account">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <Settings className="mr-2 h-4 w-4" />
                  Conta
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        )}

        <NavigationMenuItem>
          <Link to="/support">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Suporte
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavMenu;
