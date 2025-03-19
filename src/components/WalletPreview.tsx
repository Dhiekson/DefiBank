
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCcw, ChevronRight, Bitcoin, Coins } from 'lucide-react';

const WalletPreview: React.FC = () => {
  const walletRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, observerOptions);
    
    const elements = walletRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section id="wallet" className="section bg-gradient-to-b from-white to-blue-50" ref={walletRef}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 space-y-8 relative">
          {/* Wallet UI Preview */}
          <div className="glass-card shadow-glass-xl p-8 animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-bank-navy">Carteira Digital</h3>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <RefreshCcw size={18} className="text-bank-gray" />
              </Button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-bank-gray mb-1">Saldo Total</p>
              <h2 className="text-3xl font-bold text-bank-navy">R$ 38.659,42</h2>
              <div className="flex items-center text-green-600 text-sm mt-1">
                <ArrowUpRight size={14} className="mr-1" />
                <span>+2.4% nas últimas 24h</span>
              </div>
            </div>
            
            <div className="flex space-x-3 mb-8">
              <Button size="sm" className="bg-bank-blue text-white hover:bg-bank-blue-light rounded-full">
                <ArrowUpRight size={14} className="mr-1.5" />
                Enviar
              </Button>
              <Button size="sm" className="bg-bank-blue text-white hover:bg-bank-blue-light rounded-full">
                <ArrowDownRight size={14} className="mr-1.5" />
                Receber
              </Button>
              <Button size="sm" variant="outline" className="rounded-full">
                <RefreshCcw size={14} className="mr-1.5" />
                Converter
              </Button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-bank-navy">Seus Ativos</h4>
              
              <div className="glass p-4 rounded-xl flex items-center">
                <div className="mr-3 p-2 rounded-full bg-amber-100">
                  <Bitcoin size={24} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">Bitcoin</p>
                    <p className="font-medium">R$ 22.458,13</p>
                  </div>
                  <div className="flex justify-between text-sm text-bank-gray mt-1">
                    <p>0.431 BTC</p>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight size={12} className="mr-1" />
                      <span>3.2%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass p-4 rounded-xl flex items-center">
                <div className="mr-3 p-2 rounded-full bg-blue-100">
                  <Coins size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">Ethereum</p>
                    <p className="font-medium">R$ 9.845,29</p>
                  </div>
                  <div className="flex justify-between text-sm text-bank-gray mt-1">
                    <p>3.21 ETH</p>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight size={12} className="mr-1" />
                      <span>1.8%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" className="w-full justify-between text-bank-blue">
                <span>Ver todos os ativos</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="order-1 lg:order-2 space-y-8">
          <div className="inline-block animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full glass text-sm font-medium text-bank-blue">
              <Wallet size={14} className="mr-1.5" />
              Carteira Integrada
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-bank-navy animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
            Gerencie seus ativos digitais com facilidade
          </h2>
          
          <p className="text-lg text-bank-gray-dark max-w-xl animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
            Nossa carteira digital integrada permite que você gerencie todas as suas criptomoedas e ativos digitais em um só lugar, com uma interface intuitiva e segura.
          </p>
          
          <ul className="space-y-4 animate-on-scroll" style={{ transitionDelay: '0.4s' }}>
            {[
              "Suporte para múltiplas criptomoedas (BTC, ETH, tokens ERC-20)",
              "Acompanhamento de preços em tempo real",
              "Histórico detalhado de transações",
              "Backup criptografado na nuvem",
              "Autenticação de dois fatores para máxima segurança"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-bank-gray-dark">{item}</span>
              </li>
            ))}
          </ul>
          
          <div className="pt-4 animate-on-scroll" style={{ transitionDelay: '0.5s' }}>
            <Button className="primary-button">
              Começar a usar agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletPreview;
