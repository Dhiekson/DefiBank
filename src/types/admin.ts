
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
