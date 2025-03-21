
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, QrCode, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import PixKeyList from '@/components/pix/PixKeyList';
import PixSendForm from '@/components/pix/PixSendForm';
import PixQRCode from '@/components/pix/PixQRCode';

const Pix: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("send");
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSendSuccess = (sentAmount: number) => {
    // Reload wallet data or do any other necessary actions
    navigate('/wallet');
  };

  const handleOpenQRCode = () => {
    if (amount <= 0 || !description) {
      toast({
        title: "Campos incompletos",
        description: "Informe um valor e descrição para gerar o QR Code.",
        variant: "destructive"
      });
      return;
    }
    
    setShowQRDialog(true);
  };

  if (authLoading) {
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
          <h1 className="text-2xl md:text-3xl font-bold text-bank-navy mb-6">PIX</h1>
          
          <div className="glass-card shadow-glass-xl p-6 md:p-8 mb-8">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="send" className="flex items-center gap-1">
                  <ArrowUpRight size={16} />
                  <span>Enviar</span>
                </TabsTrigger>
                <TabsTrigger value="receive" className="flex items-center gap-1">
                  <ArrowDownRight size={16} />
                  <span>Receber</span>
                </TabsTrigger>
                <TabsTrigger value="keys" className="flex items-center gap-1">
                  <Key size={16} />
                  <span>Chaves</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="send" className="space-y-4">
                <PixSendForm onSuccess={handleSendSuccess} />
              </TabsContent>
              
              <TabsContent value="receive" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="receiveAmount" className="block text-sm font-medium text-gray-700">
                      Valor (R$)
                    </label>
                    <input
                      id="receiveAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="receiveDescription" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <input
                      id="receiveDescription"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Pagamento, transferência, etc."
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bank-blue"
                      required
                    />
                  </div>
                  
                  <Button 
                    onClick={handleOpenQRCode}
                    className="w-full bg-bank-blue hover:bg-bank-blue-light flex items-center justify-center gap-2"
                  >
                    <QrCode size={16} />
                    <span>Gerar QR Code</span>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="keys" className="space-y-4">
                <PixKeyList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code PIX</DialogTitle>
          </DialogHeader>
          <PixQRCode amount={amount} description={description} />
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Pix;
