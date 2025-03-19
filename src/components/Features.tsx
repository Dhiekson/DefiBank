
import React, { useEffect, useRef } from 'react';
import { Sparkles, Shield, RefreshCw, CreditCard, Clock, BarChart3 } from 'lucide-react';

const Feature: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}> = ({ icon, title, description, delay }) => {
  return (
    <div 
      className="glass-card animate-on-scroll" 
      style={{ transitionDelay: delay }}
    >
      <div className="mb-4 p-3 rounded-full bg-bank-blue/10 w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-bank-navy">{title}</h3>
      <p className="text-bank-gray">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  
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
    
    const elements = featuresRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const features = [
    {
      icon: <Sparkles size={24} className="text-bank-blue" />,
      title: "DeFi Instantâneo",
      description: "Acesse protocolos DeFi líderes com apenas alguns cliques, sem complicações técnicas.",
      delay: "0.1s"
    },
    {
      icon: <Shield size={24} className="text-bank-blue" />,
      title: "Segurança Máxima",
      description: "Autenticação de dois fatores e criptografia end-to-end para proteger seus ativos digitais.",
      delay: "0.2s"
    },
    {
      icon: <RefreshCw size={24} className="text-bank-blue" />,
      title: "Conversão Fácil",
      description: "Troque entre criptomoedas e moedas fiduciárias com taxas competitivas e liquidez instantânea.",
      delay: "0.3s"
    },
    {
      icon: <CreditCard size={24} className="text-bank-blue" />,
      title: "Cartão Virtual",
      description: "Utilize seus ativos digitais para compras do dia a dia com nosso cartão virtual integrado.",
      delay: "0.4s"
    },
    {
      icon: <Clock size={24} className="text-bank-blue" />,
      title: "Transações 24/7",
      description: "Envie e receba valores a qualquer momento, sem restrições de horário bancário tradicional.",
      delay: "0.5s"
    },
    {
      icon: <BarChart3 size={24} className="text-bank-blue" />,
      title: "Análises Detalhadas",
      description: "Acompanhe seu portfólio com gráficos interativos e relatórios personalizados.",
      delay: "0.6s"
    }
  ];

  return (
    <section id="services" className="section" ref={featuresRef}>
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h2 className="inline-flex items-center px-4 py-1.5 rounded-full glass text-sm font-medium text-bank-blue mb-4 animate-on-scroll">
          <Sparkles size={14} className="mr-1.5" />
          Nossos Serviços
        </h2>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-bank-navy animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
          Revolucione sua experiência bancária
        </h2>
        <p className="text-lg text-bank-gray-dark animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
          Combinamos a segurança dos bancos tradicionais com a inovação da tecnologia blockchain para uma experiência financeira superior.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Feature 
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={feature.delay}
          />
        ))}
      </div>
    </section>
  );
};

export default Features;
