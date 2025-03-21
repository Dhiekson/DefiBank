
import { Json } from '@/integrations/supabase/types';

export interface TransactionType {
  id: string;
  transaction_type: string;
  daily_limit: number;
  transaction_limit: number;
  fee_percentage: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  balance: number;
  status: string;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  recipient_id: string | null;
  description: string;
  status: string;
  created_at: string;
}

export interface PixKey {
  id: string;
  key_type: string;
  key_value: string;
  is_active: boolean;
  created_at: string;
  user_id: string;
}

// Type guard for checking if an object is a PixKey
export function isPixKey(obj: any): obj is PixKey {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'key_type' in obj &&
    'key_value' in obj &&
    'is_active' in obj
  );
}
