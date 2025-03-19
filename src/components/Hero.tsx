
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const elements = heroRef.current?.querySelectorAll('.animate-on-scroll');
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
    <div className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-b from-blue-50 to-white" ref={heroRef}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-bank-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-bank-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent"></div>
      </div>
      
      <div className="section relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full glass text-sm font-medium text-bank-blue">
                <Shield size={14} className="mr-1.5" />
                Segurança de nível bancário
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <span className="text-bank-navy">O futuro das finanças é </span>
              <span className="text-gradient">descentralizado</span>
            </h1>
            
            <p className="text-lg md:text-xl text-bank-gray-dark max-w-xl animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
              Experimente o poder da tecnologia blockchain com uma interface familiar. Transações seguras, transparentes e sem intermediários.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-on-scroll" style={{ transitionDelay: '0.4s' }}>
              <Button className="primary-button group">
                Começar agora
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="secondary-button">
                Como funciona
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 animate-on-scroll" style={{ transitionDelay: '0.5s' }}>
              <div className="flex items-center">
                <div className="mr-2 p-2 rounded-full bg-blue-100">
                  <Shield size={16} className="text-bank-blue" />
                </div>
                <span className="text-sm font-medium">100% Seguro</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 p-2 rounded-full bg-blue-100">
                  <Lock size={16} className="text-bank-blue" />
                </div>
                <span className="text-sm font-medium">Privativo</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 p-2 rounded-full bg-blue-100">
                  <TrendingUp size={16} className="text-bank-blue" />
                </div>
                <span className="text-sm font-medium">Alta performance</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-[450px] flex items-center justify-center animate-on-scroll" style={{ transitionDelay: '0.6s' }}>
            {/* Stylized card visual */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[420px] bg-gradient-to-br from-bank-blue to-bank-accent rounded-3xl rotate-6 animate-pulse-slow shadow-xl"></div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] glass-dark rounded-3xl shadow-glass-xl animate-float">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-8 rounded-md bg-white/20 backdrop-blur-sm"></div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm"></div>
                </div>
                
                <div className="mt-3 mb-6">
                  <div className="w-36 h-6 rounded-md bg-white/20 backdrop-blur-sm mb-2"></div>
                  <div className="w-48 h-10 rounded-md bg-white/30 backdrop-blur-sm">
                    <div className="shimmer h-full w-full"></div>
                  </div>
                </div>
                
                <div className="mt-auto space-y-4">
                  <div className="w-full h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center px-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 mr-3"></div>
                    <div className="flex-1">
                      <div className="w-24 h-3 rounded-full bg-white/20 mb-2"></div>
                      <div className="w-16 h-3 rounded-full bg-white/15"></div>
                    </div>
                    <div className="w-16 h-6 rounded-md bg-white/20"></div>
                  </div>
                  
                  <div className="w-full h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center px-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 mr-3"></div>
                    <div className="flex-1">
                      <div className="w-20 h-3 rounded-full bg-white/20 mb-2"></div>
                      <div className="w-12 h-3 rounded-full bg-white/15"></div>
                    </div>
                    <div className="w-16 h-6 rounded-md bg-white/20"></div>
                  </div>
                  
                  <div className="w-full h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="w-24 h-4 rounded-full bg-bank-blue/80"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
