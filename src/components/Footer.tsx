
import React from 'react';
import { Shield, Mail, MessageSquare, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h2 className="font-bold text-2xl text-gradient mb-6">DeFiBank</h2>
            <p className="text-bank-gray-dark mb-6">
              Revolucionando a experiência bancária com tecnologia blockchain e interfaces intuitivas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-bank-blue/10 text-bank-blue hover:bg-bank-blue/20 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-bank-blue/10 text-bank-blue hover:bg-bank-blue/20 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-bank-blue/10 text-bank-blue hover:bg-bank-blue/20 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-bank-navy mb-4">Produto</h3>
            <ul className="space-y-2">
              {['Carteira Digital', 'Transações', 'Segurança', 'API', 'Tarifas'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-bank-gray-dark hover:text-bank-blue transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-bank-navy mb-4">Empresa</h3>
            <ul className="space-y-2">
              {['Sobre nós', 'Carreiras', 'Blog', 'Parceiros', 'Imprensa'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-bank-gray-dark hover:text-bank-blue transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-bank-navy mb-4">Suporte</h3>
            <ul className="space-y-2">
              {['Centro de Ajuda', 'Contato', 'Status', 'Documentação', 'FAQs'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-bank-gray-dark hover:text-bank-blue transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-bank-gray text-sm mb-4 md:mb-0">
              © 2023 DeFiBank. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-bank-gray text-sm hover:text-bank-blue transition-colors">
                Termos de Serviço
              </a>
              <a href="#" className="text-bank-gray text-sm hover:text-bank-blue transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-bank-gray text-sm hover:text-bank-blue transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
