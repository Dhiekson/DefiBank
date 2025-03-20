
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowDownRight, ArrowUpRight, Clock, Filter, Search, Download, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

const TransactionItem: React.FC<{
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  status?: 'completed' | 'pending';
}> = ({ type, amount, description, date, status = 'completed' }) => {
  return (
    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
          {type === 'in' ? (
            <ArrowDownRight size={20} className="text-green-600" />
          ) : (
            <ArrowUpRight size={20} className="text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-bank-navy">{description}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
          {type === 'in' ? '+' : '-'}R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {status === 'pending' && (
          <div className="flex items-center text-amber-600 text-sm">
            <Clock size={12} className="mr-1" />
            <span>Pendente</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Transactions: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [description, setDescription] = useState("");
  const [asset, setAsset] = useState("BRL");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else {
      // Carregar transações (simulado)
      loadTransactions();
      
      // Verificar se há uma ação específica a ser executada
      if (location.state?.action === 'send') {
        setShowSendDialog(true);
      } else if (location.state?.action === 'receive') {
        setShowReceiveDialog(true);
      }
    }
  }, [user, isLoading, navigate, location.state]);

  const loadTransactions = () => {
    // Dados simulados para demonstração
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'in',
        amount: 1250.00,
        description: 'Depósito recebido',
        date: 'Hoje, 14:30',
        status: 'completed'
      },
      {
        id: '2',
        type: 'out',
        amount: 450.00,
        description: 'Transferência para João Silva',
        date: 'Ontem, 09:15',
        status: 'completed'
      },
      {
        id: '3',
        type: 'out',
        amount: 120.00,
        description: 'Compra de Bitcoin',
        date: '22/03/2025',
        status: 'completed'
      },
      {
        id: '4',
        type: 'in',
        amount: 890.00,
        description: 'Venda de Ethereum',
        date: '20/03/2025',
        status: 'completed'
      },
      {
        id: '5',
        type: 'in',
        amount: 350.00,
        description: 'Recompensa de staking',
        date: '18/03/2025',
        status: 'pending'
      },
      {
        id: '6',
        type: 'out',
        amount: 75.00,
        description: 'Taxa de conversão',
        date: '15/03/2025',
        status: 'completed'
      }
    ];
    
    setTransactions(mockTransactions);
  };

  const handleSendMoney = () => {
    if (!amount || parseFloat(amount) <= 0 || !recipient || !description) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simular envio de transação
    setTimeout(() => {
      // Adicionar nova transação à lista
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'out',
        amount: parseFloat(amount),
        description: `Transferência para ${recipient}: ${description}`,
        date: 'Agora mesmo',
        status: 'completed'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Limpar formulário e fechar diálogo
      setAmount("");
      setRecipient("");
      setDescription("");
      setShowSendDialog(false);
      setIsSubmitting(false);
      
      toast({
        title: "Transferência realizada",
        description: `R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviados com sucesso para ${recipient}.`
      });
    }, 1500);
  };

  const handleReceiveMoney = () => {
    if (!amount || parseFloat(amount) <= 0 || !description) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simular recebimento
    setTimeout(() => {
      // Gerar código QR simulado
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=defibank:${user?.id}:${amount}:${description}`;
      
      // Mostrar notificação com link para QR code
      toast({
        title: "Solicitação de depósito criada",
        description: "Compartilhe o código QR ou o link abaixo para receber o pagamento."
      });
      
      // Adicionar transação pendente
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'in',
        amount: parseFloat(amount),
        description: description,
        date: 'Agora mesmo',
        status: 'pending'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Limpar formulário e fechar diálogo
      setAmount("");
      setDescription("");
      setShowReceiveDialog(false);
      setIsSubmitting(false);
    }, 1500);
  };

  const filteredTransactions = searchTerm 
    ? transactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.amount.toString().includes(searchTerm)
      )
    : transactions;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-bank-navy">Transações</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReceiveDialog(true)}
                className="flex items-center gap-1"
              >
                <ArrowDownRight size={14} />
                <span>Receber</span>
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowSendDialog(true)}
                className="flex items-center gap-1"
              >
                <ArrowUpRight size={14} />
                <span>Enviar</span>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar transações" 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  <span>Filtrar</span>
                </Button>
                <Button size="sm" className="flex items-center gap-1">
                  <Download size={14} />
                  <span>Exportar</span>
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id}
                    type={transaction.type} 
                    amount={transaction.amount} 
                    description={transaction.description} 
                    date={transaction.date}
                    status={transaction.status}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? "Nenhuma transação encontrada para esta busca." : "Nenhuma transação encontrada."}
                </div>
              )}
            </div>
            
            <div className="p-4 text-center text-sm text-gray-500">
              Mostrando {filteredTransactions.length} de {transactions.length} transações
            </div>
          </div>
        </div>
      </div>
      
      {/* Diálogo de Enviar Dinheiro */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enviar Dinheiro</DialogTitle>
            <DialogDescription>
              Preencha os dados para realizar uma transferência.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">R$</span>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="asset" className="text-right">
                Moeda
              </Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Destinatário
              </Label>
              <Input
                id="recipient"
                placeholder="Nome ou chave PIX"
                className="col-span-3"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                placeholder="Motivo da transferência"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSendMoney} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Receber Dinheiro */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Receber Dinheiro</DialogTitle>
            <DialogDescription>
              Crie uma solicitação de pagamento para compartilhar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receive-amount" className="text-right">
                Valor
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">R$</span>
                <Input
                  id="receive-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receive-asset" className="text-right">
                Moeda
              </Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receive-description" className="text-right">
                Descrição
              </Label>
              <Input
                id="receive-description"
                placeholder="Motivo da cobrança"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleReceiveMoney} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar cobrança"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Transactions;
