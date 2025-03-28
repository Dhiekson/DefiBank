
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, ShieldCheck, Bell, Eye, Key, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AccountSettings = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (user) {
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
    }
  }, [user, isLoading, navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-bank-navy mb-6">Configurações da Conta</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 md:grid-cols-5 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User size={16} />
                <span className="hidden md:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span className="hidden md:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet size={16} />
                <span className="hidden md:inline">Carteiras</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell size={16} />
                <span className="hidden md:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="hidden md:flex items-center gap-2">
                <Eye size={16} />
                <span className="hidden md:inline">Privacidade</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" alt={fullName} />
                      <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h3 className="font-medium text-lg">{fullName || 'Usuário'}</h3>
                      <p className="text-sm text-muted-foreground">{email}</p>
                      <Button variant="outline" size="sm">Alterar foto</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome completo</Label>
                        <Input 
                          id="fullName" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" value={email} disabled />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={handleUpdateProfile} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Gerencie sua senha e segurança da conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Alterar senha</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle>Carteiras conectadas</CardTitle>
                  <CardDescription>
                    Gerencie suas carteiras de criptomoedas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Wallet connect buttons would go here */}
                    <p className="text-muted-foreground">Conecte suas carteiras externas para comprar e vender criptomoedas</p>
                    <Button variant="outline" onClick={() => navigate('/crypto')}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Conectar carteira
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de notificações</CardTitle>
                  <CardDescription>
                    Escolha como deseja receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Configurações de notificação serão implementadas em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacidade</CardTitle>
                  <CardDescription>
                    Gerencie suas configurações de privacidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Configurações de privacidade serão implementadas em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountSettings;
