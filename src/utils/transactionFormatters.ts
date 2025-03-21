
export const formatTransactionType = (type: string): 'in' | 'out' => {
  switch (type) {
    case 'deposit':
    case 'transfer_in':
    case 'pix_in':
      return 'in';
    case 'withdrawal':
    case 'transfer_out':
    case 'pix_out':
      return 'out';
    default:
      return 'in'; // Default fallback
  }
};

export const formatTransactionDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch (e) {
    return new Date().toLocaleDateString('pt-BR');
  }
};

export const getTransactionTypeLabel = (type: string): string => {
  switch (type) {
    case 'deposit':
      return 'Depósito';
    case 'withdrawal':
      return 'Saque';
    case 'transfer_in':
      return 'Transferência recebida';
    case 'transfer_out':
      return 'Transferência enviada';
    case 'pix_in':
      return 'PIX recebido';
    case 'pix_out':
      return 'PIX enviado';
    case 'conversion':
      return 'Conversão';
    default:
      return 'Transação';
  }
};
