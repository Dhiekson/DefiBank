
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Search, User, DollarSign, Settings, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getTransactionTypeLabel } from '@/utils/transactionFormatters';

import { InputGroup, InputRightElement } from '@chakra-ui/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TransactionType {
  id: string;
  transaction_type: string;
  daily_limit: number;
  transaction_limit: number;
  fee_percentage: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  balance: number;
  status: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  recipient_id: string | null;
  description: string;
  status: string;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("users");
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionLimits, setTransactionLimits] = useState<TransactionType[]>([]);
  
  const [userSearch, setUserSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [editingLimit, setEditingLimit] = useState<TransactionType | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // Form states for editing limits
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactionLimit, setTransactionLimit] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);

  const checkAdminStatus = useCallback(async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      return data?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        checkAdminStatus().then(isAdmin => {
          setIsAdmin(isAdmin);
          if (!isAdmin) {
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão para acessar esta página.",
              variant: "destructive"
            });
            navigate('/');
          } else {
            loadData();
          }
        });
      }
    }
  }, [user, authLoading, navigate, checkAdminStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadTransactions(),
        loadTransactionLimits()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados administrativos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // First get all users from auth schema
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Then get all profiles with their wallets
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, role, created_at');
        
      if (profilesError) throw profilesError;
      
      // Get wallet data
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id, balance');
        
      if (walletsError) throw walletsError;
      
      // Merge the data
      const mergedUsers = profiles.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        const wallet = wallets.find(w => w.user_id === profile.id);
        
        return {
          id: profile.id,
          name: profile.name || 'No name',
          email: authUser?.email || 'No email',
          role: profile.role,
          created_at: profile.created_at,
          balance: wallet?.balance || 0,
          status: authUser?.banned ? 'Blocked' : authUser?.email_confirmed ? 'Active' : 'Pending'
        };
      });
      
      setUsers(mergedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      throw error;
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  };

  const loadTransactionLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_limits')
        .select('*')
        .order('transaction_type');
        
      if (error) throw error;
      
      setTransactionLimits(data || []);
    } catch (error) {
      console.error('Error loading transaction limits:', error);
      throw error;
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      // This is a simplified approach. In a real application, you would use 
      // proper admin APIs to ban/unban users
      const newBanStatus = currentStatus === 'Blocked' ? false : true;
      
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { banned: newBanStatus }
      );
      
      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: `O usuário foi ${newBanStatus ? 'bloqueado' : 'desbloqueado'} com sucesso.`
      });
      
      // Reload users to reflect the change
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive"
      });
    }
  };

  const handleEditLimit = (limit: TransactionType) => {
    setEditingLimit(limit);
    setDailyLimit(limit.daily_limit);
    setTransactionLimit(limit.transaction_limit);
    setFeePercentage(limit.fee_percentage);
    setShowLimitDialog(true);
  };

  const handleSaveLimit = async () => {
    if (!editingLimit) return;
    
    try {
      const { error } = await supabase
        .from('transaction_limits')
        .update({
          daily_limit: dailyLimit,
          transaction_limit: transactionLimit,
          fee_percentage: feePercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingLimit.id);
        
      if (error) throw error;
      
      toast({
        title: "Limite atualizado",
        description: "O limite de transação foi atualizado com sucesso."
      });
      
      setShowLimitDialog(false);
      
      // Reload limits to reflect the change
      await loadTransactionLimits();
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: "Erro ao atualizar limite",
        description: "Não foi possível atualizar o limite de transação.",
        variant: "destructive"
      });
    }
  };

  const makeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "O usuário agora é um administrador."
      });
      
      // Reload users to reflect the change
      await loadUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar o perfil do usuário.",
        variant: "destructive"
      });
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "O privilégio de administrador foi removido."
      });
      
      // Reload users to reflect the change
      await loadUsers();
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar o perfil do usuário.",
        variant: "destructive"
      });
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    transaction.id.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    transaction.user_id.toLowerCase().includes(transactionSearch.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  if (authLoading || isLoading || !isAdmin) {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-bank-navy">Painel de Administração</h1>
            <Button 
              variant="outline" 
              onClick={loadData}
              className="flex items-center gap-1"
            >
              <RefreshCcw size={14} />
              <span>Atualizar</span>
            </Button>
          </div>
          
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="users" className="flex items-center gap-1">
                <User size={16} />
                <span>Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-1">
                <DollarSign size={16} />
                <span>Transações</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings size={16} />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue mb-4"
                />
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.role === 'admin' ? 'Admin' : 'Usuário'}
                            </span>
                          </TableCell>
                          <TableCell>{formatCurrency(user.balance)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : user.status === 'Blocked' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {user.status === 'Active' 
                                ? 'Ativo' 
                                : user.status === 'Blocked' 
                                  ? 'Bloqueado' 
                                  : 'Pendente'}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id, user.status)}
                                className={user.status === 'Blocked' ? 'text-green-600' : 'text-red-600'}
                              >
                                {user.status === 'Blocked' ? 'Desbloquear' : 'Bloquear'}
                              </Button>
                              {user.role === 'admin' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeAdminRole(user.id)}
                                >
                                  Remover Admin
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => makeUserAdmin(user.id)}
                                >
                                  Tornar Admin
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue mb-4"
                />
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-xs">
                            {transaction.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.user_id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {getTransactionTypeLabel(transaction.type)}
                          </TableCell>
                          <TableCell 
                            className={
                              transaction.type.includes('in') || transaction.type === 'deposit'
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }
                          >
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {transaction.status === 'completed' ? (
                                <CheckCircle size={14} className="text-green-500 mr-1" />
                              ) : transaction.status === 'pending' ? (
                                <AlertTriangle size={14} className="text-amber-500 mr-1" />
                              ) : (
                                <AlertTriangle size={14} className="text-red-500 mr-1" />
                              )}
                              <span className={
                                transaction.status === 'completed' 
                                  ? 'text-green-600' 
                                  : transaction.status === 'pending'
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                              }>
                                {transaction.status === 'completed' 
                                  ? 'Concluída' 
                                  : transaction.status === 'pending'
                                    ? 'Pendente'
                                    : 'Falhou'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description || 'N/A'}</TableCell>
                          <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Nenhuma transação encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Transação</TableHead>
                      <TableHead>Limite Diário</TableHead>
                      <TableHead>Limite por Transação</TableHead>
                      <TableHead>Taxa (%)</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionLimits.map((limit) => (
                      <TableRow key={limit.id}>
                        <TableCell>{getTransactionTypeLabel(limit.transaction_type)}</TableCell>
                        <TableCell>{formatCurrency(limit.daily_limit)}</TableCell>
                        <TableCell>{formatCurrency(limit.transaction_limit)}</TableCell>
                        <TableCell>{limit.fee_percentage.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditLimit(limit)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Limite de Transação</DialogTitle>
          </DialogHeader>
          
          {editingLimit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Transação
                </label>
                <input
                  type="text"
                  value={getTransactionTypeLabel(editingLimit.transaction_type)}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700">
                  Limite Diário (R$)
                </label>
                <input
                  id="dailyLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="transactionLimit" className="block text-sm font-medium text-gray-700">
                  Limite por Transação (R$)
                </label>
                <input
                  id="transactionLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transactionLimit}
                  onChange={(e) => setTransactionLimit(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="feePercentage" className="block text-sm font-medium text-gray-700">
                  Taxa (%)
                </label>
                <input
                  id="feePercentage"
                  type="number"
                  min="0"
                  step="0.01"
                  max="100"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                />
              </div>
              
              <Button
                onClick={handleSaveLimit}
                className="w-full bg-bank-blue hover:bg-bank-blue-light"
              >
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
