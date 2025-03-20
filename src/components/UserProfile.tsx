
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
