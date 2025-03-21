
import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PixKeyForm from './PixKeyForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PixKey {
  id: string;
  key_type: 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';
  key_value: string;
  is_active: boolean;
  created_at: string;
}

const PixKeyList: React.FC = () => {
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPixKeys();
    }
  }, [user]);

  const loadPixKeys = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pix_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPixKeys(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar chaves PIX:', error.message);
      toast({
        title: "Erro ao carregar chaves PIX",
        description: "Não foi possível carregar suas chaves PIX.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async (keyType: 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM', keyValue: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('pix_keys')
        .insert([{
          user_id: user.id,
          key_type: keyType,
          key_value: keyValue
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Chave PIX criada",
        description: "Sua nova chave PIX foi criada com sucesso.",
      });
      
      setShowAddDialog(false);
      loadPixKeys();
    } catch (error: any) {
      console.error('Erro ao criar chave PIX:', error.message);
      toast({
        title: "Erro ao criar chave PIX",
        description: error.message || "Não foi possível criar a chave PIX.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('pix_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Chave PIX excluída",
        description: "A chave PIX foi excluída com sucesso.",
      });
      
      setPixKeys(pixKeys.filter(key => key.id !== keyId));
    } catch (error: any) {
      console.error('Erro ao excluir chave PIX:', error.message);
      toast({
        title: "Erro ao excluir chave PIX",
        description: error.message || "Não foi possível excluir a chave PIX.",
        variant: "destructive"
      });
    }
  };

  const formatKeyType = (type: string) => {
    switch (type) {
      case 'CPF':
        return 'CPF';
      case 'EMAIL':
        return 'E-mail';
      case 'PHONE':
        return 'Telefone';
      case 'RANDOM':
        return 'Aleatória';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md"></div>
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-bank-navy">Suas Chaves PIX</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Plus size={14} />
              <span>Adicionar</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Chave PIX</DialogTitle>
            </DialogHeader>
            <PixKeyForm onSubmit={handleCreateKey} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3">
        {pixKeys.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Key className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>Você ainda não tem chaves PIX cadastradas.</p>
            <p className="text-sm">Adicione sua primeira chave para receber transferências via PIX.</p>
          </div>
        ) : (
          pixKeys.map(key => (
            <div key={key.id} className="p-4 bg-white rounded-lg border border-gray-100 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-bank-blue" />
                  <span className="font-medium">{formatKeyType(key.key_type)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{key.key_value}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteKey(key.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PixKeyList;
