
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail, Phone, FileQuestion, PhoneCall, Send } from 'lucide-react';

const Support: React.FC = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos do formulário.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simular envio do formulário
    setTimeout(() => {
      toast({
        title: "Mensagem enviada",
        description: "Recebemos sua mensagem. Entraremos em contato em breve!"
      });
      
      // Limpar formulário
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 1500);
  };

  const faqItems = [
    {
      question: "Como funciona a carteira digital?",
      answer: "Nossa carteira digital permite que você armazene, envie e receba criptomoedas e moedas fiduciárias. Todas as transações são processadas em uma rede blockchain segura, proporcionando transparência e segurança para suas operações financeiras."
    },
    {
      question: "Quais moedas o DeFiBank aceita?",
      answer: "Atualmente, o DeFiBank suporta Bitcoin (BTC), Ethereum (ETH), e vários tokens ERC-20. Também oferecemos suporte para transações em reais (BRL) com conversão automática para as criptomoedas de sua escolha."
    },
    {
      question: "Como faço para sacar meu dinheiro?",
      answer: "Para sacar fundos, acesse sua carteira digital, clique em 'Enviar', selecione a moeda que deseja enviar e o método de saque (PIX, TED, ou transferência para outra carteira). Siga as instruções na tela para concluir a transação."
    },
    {
      question: "O DeFiBank é seguro?",
      answer: "Sim! Utilizamos criptografia de ponta a ponta e autenticação de dois fatores para proteger sua conta. Todos os dados são armazenados em servidores seguros, e suas chaves privadas nunca saem do seu dispositivo, garantindo total controle sobre seus ativos."
    },
    {
      question: "Quanto custa usar o DeFiBank?",
      answer: "O cadastro e manutenção da conta são gratuitos. Cobramos apenas pequenas taxas para transações específicas, como conversão entre moedas (0,5%) e saques para contas bancárias (R$ 2,50 por saque). Consulte nossa página de taxas para mais detalhes."
    },
    {
      question: "Posso usar o DeFiBank em dispositivos móveis?",
      answer: "Sim! O DeFiBank está disponível para iOS e Android. Baixe nosso aplicativo na App Store ou Google Play para acessar sua conta de qualquer lugar, a qualquer momento."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-bank-navy mb-2">Suporte</h1>
          <p className="text-bank-gray-dark mb-8">Estamos aqui para ajudar! Confira nossas perguntas frequentes ou entre em contato conosco.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-bank-blue" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Telefone</h3>
              <p className="text-bank-gray-dark mb-4">Disponível 24/7 para emergências</p>
              <a href="tel:+551140028922" className="text-bank-blue font-medium">+55 11 4002-8922</a>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-bank-blue" />
              </div>
              <h3 className="text-lg font-semibold mb-2">E-mail</h3>
              <p className="text-bank-gray-dark mb-4">Resposta em até 24 horas</p>
              <a href="mailto:suporte@defibank.com.br" className="text-bank-blue font-medium">suporte@defibank.com.br</a>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-bank-blue" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Chat ao vivo</h3>
              <p className="text-bank-gray-dark mb-4">Segunda a sexta, 9h às 18h</p>
              <Button 
                variant="outline" 
                className="text-bank-blue border-bank-blue hover:bg-bank-blue hover:text-white"
                onClick={() => {
                  toast({
                    title: "Chat ao vivo",
                    description: "O recurso de chat ao vivo estará disponível em breve!"
                  });
                }}
              >
                Iniciar chat
              </Button>
            </div>
          </div>
          
          {/* Perguntas Frequentes */}
          <div className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-bank-navy mb-6">Perguntas Frequentes</h2>
            
            <Accordion type="single" collapsible className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-0 text-bank-gray-dark">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Formulário de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-bank-navy mb-4">Entre em Contato</h2>
              <p className="text-bank-gray-dark mb-4">
                Não encontrou o que procurava? Envie-nos uma mensagem e nossa equipe entrará em contato o mais breve possível.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <PhoneCall className="h-5 w-5 text-bank-blue" />
                  <span className="text-bank-gray-dark">+55 11 4002-8922</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-bank-blue" />
                  <span className="text-bank-gray-dark">suporte@defibank.com.br</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-bank-blue" />
                  <span className="text-bank-gray-dark">Chat ao vivo (9h às 18h)</span>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu.email@exemplo.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input 
                    id="subject" 
                    placeholder="Como podemos ajudar?" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Descreva em detalhes sua dúvida ou problema..." 
                    rows={4}
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                  {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Support;
