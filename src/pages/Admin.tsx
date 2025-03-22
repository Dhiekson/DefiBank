import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { User, DollarSign, Settings, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import UsersTab from '@/components/admin/UsersTab';
import TransactionsTab from '@/components/admin/TransactionsTab';
import TransactionLimitsForm from '@/components/admin/TransactionLimitsForm';
import { UserProfile, AdminTransaction, TransactionType } from '@/types/admin';

const AdminPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("users");
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionLimits, setTransactionLimits] = useState<TransactionType[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
      
      // Make sure to handle potentially null or undefined data
      if (profiles && authUsers?.users && wallets) {
        // Merge the data
        const mergedUsers = profiles.map(profile => {
          const authUser = authUsers.users.find(u => u.id === profile.id);
          const wallet = wallets.find(w => w.user_id === profile.id);
          
          return {
            id: profile.id,
            name: profile.name || 'No name',
            email: authUser?.email || 'No email',
            role: profile.role || 'user',
            created_at: profile.created_at,
            balance: wallet?.balance || 0,
            status: authUser?.user_metadata?.banned ? 'Blocked' : (authUser?.email_confirmed_at ? 'Active' : 'Pending')
          };
        });
        
        setUsers(mergedUsers);
      }
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
      
      setTransactionLimits(data as TransactionType[] || []);
    } catch (error) {
      console.error('Error loading transaction limits:', error);
      throw error;
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
              <UsersTab users={users} loadUsers={loadUsers} />
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              <TransactionsTab transactions={transactions} />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <TransactionLimitsForm 
                transactionLimits={transactionLimits} 
                loadTransactionLimits={loadTransactionLimits} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
