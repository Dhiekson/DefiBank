
import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PixQRCodeProps {
  amount: number;
  description: string;
}

interface PixKey {
  id: string;
  key_type: string;
  key_value: string;
}

const PixQRCode: React.FC<PixQRCodeProps> = ({ amount, description }) => {
  const [selectedPixKey, setSelectedPixKey] = useState<PixKey | null>(null);
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPixKeys();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPixKey) {
      generateQRCode();
    }
  }, [selectedPixKey, amount, description]);

  const loadPixKeys = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pix_keys')
        .select('id, key_type, key_value')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      setPixKeys(data || []);
      
      // Select first key by default if available
      if (data && data.length > 0) {
        setSelectedPixKey(data[0]);
      }
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

  const generateQRCode = () => {
    if (!selectedPixKey || amount <= 0) return;
    
    // Create a PIX payload
    // This is a simplified version. In a real app, this would follow the PIX standards
    const pixData = {
      key: selectedPixKey.key_value,
      amount: amount.toFixed(2),
      description: description,
      name: user?.user_metadata?.full_name || 'Usuário',
      keyType: selectedPixKey.key_type
    };
    
    // Encode the data
    const encodedData = encodeURIComponent(JSON.stringify(pixData));
    
    // Generate QR code using an external service
    // In a production app, you might want to generate this on the server side
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
    setQrCodeUrl(qrUrl);
  };

  const handleCopyPixInfo = () => {
    if (!selectedPixKey) return;
    
    // Create a simple text representation of the PIX information
    const pixInfo = `PIX para: ${user?.user_metadata?.full_name || 'Usuário'}\nChave: ${selectedPixKey.key_value}\nValor: R$ ${amount.toFixed(2)}\nDescrição: ${description}`;
    
    navigator.clipboard.writeText(pixInfo).then(() => {
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Informações do PIX copiadas para a área de transferência."
      });
      
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar as informações.",
        variant: "destructive"
      });
    });
  };

  const handleChangePixKey = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const keyId = e.target.value;
    const key = pixKeys.find(k => k.id === keyId) || null;
    setSelectedPixKey(key);
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
      <div className="flex flex-col items-center justify-center space-y-4 p-4">
        <div className="h-40 w-40 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-6 w-40 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (pixKeys.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <QrCode className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p>Você não tem chaves PIX cadastradas.</p>
        <p className="text-sm">Adicione uma chave PIX para gerar o QR Code.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      {selectedPixKey && (
        <>
          <div className="text-center mb-4">
            <h3 className="font-medium text-gray-700">PIX de R$ {amount.toFixed(2)}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          
          <div className="border border-gray-200 p-1 rounded-lg bg-white">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="PIX QR Code" 
                className="h-48 w-48 object-contain"
              />
            ) : (
              <div className="h-48 w-48 flex items-center justify-center bg-gray-100">
                <QrCode size={64} className="text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="w-full">
            <label htmlFor="pixKeySelect" className="block text-sm font-medium text-gray-700 mb-1">
              Chave PIX para recebimento:
            </label>
            <select
              id="pixKeySelect"
              value={selectedPixKey.id}
              onChange={handleChangePixKey}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue mb-2"
            >
              {pixKeys.map(key => (
                <option key={key.id} value={key.id}>
                  {formatKeyType(key.key_type)}: {key.key_value}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={handleCopyPixInfo}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-500" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copiar informações</span>
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default PixQRCode;
