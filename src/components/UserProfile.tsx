
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserCog } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      // Check if user has role in user_metadata
      if (user?.user_metadata?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // Or check if it's in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      // Use type assertion to handle the response
      const profile = data as { role?: string };
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="text-purple-600 flex items-center">
              <UserCog size={16} className="mr-1" />
              <span className="text-xs font-medium">Admin</span>
            </div>
          )}
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => signOut()}
          >
            Sair
          </Button>
        </div>
      ) : (
        <div className="flex md:flex-row flex-col gap-2">
          <Button variant="outline" onClick={handleLogin}>
            Entrar
          </Button>
          <Button onClick={() => { handleLogin(); }}>
            Criar conta
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
