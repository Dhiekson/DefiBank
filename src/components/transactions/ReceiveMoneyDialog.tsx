
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ReceiveMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  setAmount: (amount: string) => void;
  asset: string;
  setAsset: (asset: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isSubmitting: boolean;
  onReceiveMoney: () => void;
}

const ReceiveMoneyDialog: React.FC<ReceiveMoneyDialogProps> = ({
  open,
  onOpenChange,
  amount,
  setAmount,
  asset,
  setAsset,
  description,
  setDescription,
  isSubmitting,
  onReceiveMoney
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Receber Dinheiro</DialogTitle>
          <DialogDescription>
            Crie uma solicitação de pagamento para compartilhar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receive-amount" className="text-right">
              Valor
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">R$</span>
              <Input
                id="receive-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receive-asset" className="text-right">
              Moeda
            </Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receive-description" className="text-right">
              Descrição
            </Label>
            <Input
              id="receive-description"
              placeholder="Motivo da cobrança"
              className="col-span-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={onReceiveMoney} 
            disabled={isSubmitting || !amount || !description}
          >
            {isSubmitting ? "Criando..." : "Criar cobrança"}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveMoneyDialog;
