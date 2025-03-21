
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PixQRCodeProps {
  amount: number;
  description: string;
  qrCodeUrl?: string; 
}

const PixQRCode: React.FC<PixQRCodeProps> = ({ amount, description, qrCodeUrl }) => {
  const { toast } = useToast();
  
  // Gerar URL para o QR Code se não foi fornecido
  const qrCodeImage = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=defibank:pix:${amount}:${encodeURIComponent(description)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCodeImage);
    toast({
      title: "Link copiado",
      description: "O link do QR Code foi copiado para a área de transferência."
    });
  };

  const handleDownload = () => {
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `pix-code-${amount}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "O QR Code está sendo baixado."
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border border-gray-200 p-2 rounded-lg">
        <img src={qrCodeImage} alt="QR Code PIX" className="w-64 h-64" />
      </div>
      
      <div className="text-center space-y-1">
        <p className="font-medium">Valor: R$ {amount.toFixed(2)}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCopyLink} className="flex items-center gap-1">
          <Copy size={16} />
          <span>Copiar Link</span>
        </Button>
        <Button variant="outline" onClick={handleDownload} className="flex items-center gap-1">
          <Download size={16} />
          <span>Baixar QR Code</span>
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 text-center mt-4">
        Compartilhe este QR Code com a pessoa que irá realizar o pagamento. 
        Ela pode escanear com o aplicativo do banco.
      </p>
    </div>
  );
};

export default PixQRCode;
