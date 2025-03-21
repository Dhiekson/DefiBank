
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownRight, Key } from 'lucide-react';

import PixKeyList from '@/components/pix/PixKeyList';
import PixSendForm from '@/components/pix/PixSendForm';
import PixQRCode from '@/components/pix/PixQRCode';
import PixReceiveForm from '@/components/pix/PixReceiveForm';

const PixPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
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
                <PixReceiveForm 
                  onOpenQRCode={handleOpenQRCode}
                  amount={amount}
                  setAmount={setAmount}
                  description={description}
                  setDescription={setDescription}
                />
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

export default PixPage;
