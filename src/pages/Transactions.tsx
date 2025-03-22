import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import custom components
import TransactionActions from '@/components/transactions/TransactionActions';
import TransactionSearch from '@/components/transactions/TransactionSearch';
import TransactionsList from '@/components/transactions/TransactionsList';
import SendMoneyDialog from '@/components/transactions/SendMoneyDialog';
import ReceiveMoneyDialog from '@/components/transactions/ReceiveMoneyDialog';

// Import types
import { Transaction, SupabaseTransaction, mapSupabaseTransaction } from '@/types/transaction';

const Transactions: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [description, setDescription] = useState("");
  const [asset, setAsset] = useState("BRL");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      // Carregar transações reais
      loadTransactions();
      
      // Verificar se há uma ação específica a ser executada
      if (location.state?.action === 'send') {
        setShowSendDialog(true);
      } else if (location.state?.action === 'receive') {
        setShowReceiveDialog(true);
      }
    }
  }, [user, authLoading, navigate, location.state]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Converter os dados do Supabase para o formato Transaction
      const formattedTransactions: Transaction[] = (data || []).map(
        (item: SupabaseTransaction) => mapSupabaseTransaction(item)
      );
      
      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error.message);
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar o histórico de transações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMoney = async () => {
    if (!user || !user.id) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para realizar transferências.",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0 || !recipient || !description) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Primeiro, encontrar o usuário destinatário pelo nome ou email
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('name', `%${recipient}%`)
        .limit(1);

      if (recipientError || !recipientData || recipientData.length === 0) {
        throw new Error('Destinatário não encontrado. Verifique o nome informado.');
      }

      const recipientId = recipientData[0].id;
      
      // Chamar a função RPC para processar a transferência
      const { data, error } = await supabase.rpc(
        'process_transfer',
        {
          p_sender_id: user.id,
          p_recipient_id: recipientId,
          p_amount: parseFloat(amount),
          p_description: description
        }
      );

      if (error) {
        throw error;
      }
      
      // Atualizar a lista de transações
      loadTransactions();
      
      // Limpar formulário e fechar diálogo
      setAmount("");
      setRecipient("");
      setDescription("");
      setShowSendDialog(false);
      
      toast({
        title: "Transferência realizada",
        description: `R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviados com sucesso.`
      });
      
    } catch (error: any) {
      toast({
        title: "Erro na transferência",
        description: error.message || "Não foi possível completar a transferência. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiveMoney = async () => {
    if (!user || !user.id) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para solicitar transferências.",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0 || !description) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate QR code with user data and amount
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=defibank:${user.id}:${amount}:${description}`;
      
      // Create payment request
      const { data, error } = await supabase
        .from('payment_requests')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(amount),
            description: description,
            status: 'pending',
            qr_code_url: qrCodeUrl
          }
        ]);

      if (error) {
        throw error;
      }
      
      // Create a pending transaction to display in history
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'transfer_in',
            amount: parseFloat(amount),
            description: `Cobrança: ${description}`,
            status: 'pending'
          }
        ]);

      if (transactionError) {
        console.error('Erro ao criar transação pendente:', transactionError);
      }
      
      // Update transaction list
      loadTransactions();
      
      // Clear form and close dialog
      setAmount("");
      setDescription("");
      setShowReceiveDialog(false);
      
      // Show confirmation toast and QR Code URL
      toast({
        title: "Cobrança criada com sucesso",
        description: "Um QR Code foi gerado para compartilhar com o pagador."
      });
      
      // Redirect to wallet page showing the QR Code
      navigate('/wallet', { state: { qrCodeUrl, amount, description } });
      
    } catch (error: any) {
      toast({
        title: "Erro na criação da cobrança",
        description: error.message || "Não foi possível criar a cobrança.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = searchTerm 
    ? transactions.filter(t => 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.amount.toString().includes(searchTerm)
      )
    : transactions;

  if (authLoading || isLoading) {
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
            <TransactionActions 
              onSend={() => setShowSendDialog(true)} 
              onReceive={() => setShowReceiveDialog(true)} 
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <TransactionSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onRefresh={loadTransactions}
            />
            
            <TransactionsList 
              transactions={filteredTransactions}
              filteredCount={filteredTransactions.length}
              totalCount={transactions.length}
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </div>
      
      <SendMoneyDialog 
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        amount={amount}
        setAmount={setAmount}
        asset={asset}
        setAsset={setAsset}
        recipient={recipient}
        setRecipient={setRecipient}
        description={description}
        setDescription={setDescription}
        isSubmitting={isSubmitting}
        onSendMoney={handleSendMoney}
      />
      
      <ReceiveMoneyDialog 
        open={showReceiveDialog}
        onOpenChange={setShowReceiveDialog}
        amount={amount}
        setAmount={setAmount}
        asset={asset}
        setAsset={setAsset}
        description={description}
        setDescription={setDescription}
        isSubmitting={isSubmitting}
        onReceiveMoney={handleReceiveMoney}
      />
      
      <Footer />
    </div>
  );
};

export default Transactions;
