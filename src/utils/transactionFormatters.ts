
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export const formatTransactionType = (type: string): 'in' | 'out' => {
  if (type === 'deposit' || type === 'transfer_in') {
    return 'in';
  }
  return 'out';
};

export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return `Hoje, ${format(date, 'HH:mm')}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Ontem, ${format(date, 'HH:mm')}`;
  } else {
    return format(date, 'dd/MM/yyyy', { locale: pt });
  }
};
