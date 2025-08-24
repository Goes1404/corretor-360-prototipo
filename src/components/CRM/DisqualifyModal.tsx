import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DisqualifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string, observacoes?: string) => void;
  leadName: string;
}

const motivosDesqualificacao = [
  "Sem interesse",
  "Perfil incompatível",
  "Contato perdido",
  "Lead duplicado",
  "Orçamento insuficiente",
  "Não é decisor",
  "Outro"
];

export const DisqualifyModal = ({ isOpen, onClose, onConfirm, leadName }: DisqualifyModalProps) => {
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!motivo) return;

    setLoading(true);
    await onConfirm(motivo, observacoes);
    setLoading(false);
    
    // Limpar form
    setMotivo('');
    setObservacoes('');
    onClose();
  };

  const handleClose = () => {
    setMotivo('');
    setObservacoes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Desqualificar Lead</DialogTitle>
          <DialogDescription>
            Você está prestes a desqualificar o lead <strong>{leadName}</strong>. 
            Esta ação pode ser revertida posteriormente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="motivo">Motivo da Desqualificação</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivosDesqualificacao.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações Adicionais (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações sobre a desqualificação..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={!motivo || loading}
          >
            {loading ? 'Desqualificando...' : 'Desqualificar Lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};