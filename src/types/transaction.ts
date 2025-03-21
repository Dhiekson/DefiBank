
import { Json } from '@/integrations/supabase/types';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'conversion';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  recipient_id?: string;
}

export interface SupabaseTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  recipient_id?: string;
  currency: string;
  updated_at: string;
  user_id: string;
  metadata: Json;
}

export interface TransactionItemProps {
  id: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const mapSupabaseTransaction = (item: SupabaseTransaction): Transaction => ({
  id: item.id,
  type: item.type as 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'conversion',
  amount: item.amount,
  description: item.description || '',
  status: item.status as 'pending' | 'completed' | 'failed',
  created_at: item.created_at,
  recipient_id: item.recipient_id
});
