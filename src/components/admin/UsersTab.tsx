
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { User, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/admin';

interface UsersTabProps {
  users: UserProfile[];
  loadUsers: () => Promise<void>;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, loadUsers }) => {
  const [userSearch, setUserSearch] = useState("");
  const { toast } = useToast();

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
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

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Blocked' ? false : true;
      
      // Use user_metadata instead of banned property
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { banned: newStatus } }
      );
      
      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: `O usuário foi ${newStatus ? 'bloqueado' : 'desbloqueado'} com sucesso.`
      });
      
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

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default UsersTab;
