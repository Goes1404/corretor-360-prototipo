import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLeads } from "@/hooks/useLeads";
import { useAppointments } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
  selectedDate?: Date;
  preSelectedClientId?: string;
}

export const AppointmentModal = ({ isOpen, onClose, appointment, selectedDate, preSelectedClientId }: AppointmentModalProps) => {
  const { leads } = useLeads();
  const { createAppointment, updateAppointment, cancelAppointment } = useAppointments();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    title: 'Atendimento',
    date: '',
    time: '',
    location: '',
    notes: '',
    status: 'AGENDADO'
  });

  useEffect(() => {
    if (appointment) {
      // Edição
      const appointmentDate = new Date(appointment.date_time);
      setFormData({
        client_id: appointment.client_id,
        title: appointment.title,
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'HH:mm'),
        location: appointment.location || '',
        notes: appointment.notes || '',
        status: appointment.status
      });
    } else {
      // Novo agendamento
      const defaultDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      setFormData({
        client_id: preSelectedClientId || '',
        title: 'Atendimento',
        date: defaultDate,
        time: '09:00',
        location: '',
        notes: '',
        status: 'AGENDADO'
      });
    }
  }, [appointment, selectedDate, preSelectedClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.date || !formData.time) {
      return;
    }

    setLoading(true);

    const dateTime = `${formData.date}T${formData.time}:00`;

    if (appointment) {
      // Atualização
      const success = await updateAppointment(appointment.id, {
        client_id: formData.client_id,
        title: formData.title,
        date_time: dateTime,
        location: formData.location,
        notes: formData.notes,
        status: formData.status as any
      });

      if (success) {
        onClose();
      }
    } else {
      // Criação
      const success = await createAppointment({
        client_id: formData.client_id,
        title: formData.title,
        date_time: dateTime,
        location: formData.location,
        notes: formData.notes
      });

      if (success) {
        onClose();
      }
    }

    setLoading(false);
  };

  const handleCancel = async () => {
    if (appointment) {
      setLoading(true);
      const success = await cancelAppointment(appointment.id);
      if (success) {
        onClose();
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Editar Atendimento' : 'Novo Atendimento'}
          </DialogTitle>
          <DialogDescription>
            {appointment 
              ? 'Edite os dados do atendimento ou altere seu status.'
              : 'Agende um novo atendimento com seu cliente.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_id">Cliente</Label>
            <Select 
              value={formData.client_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
              disabled={!!preSelectedClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} {lead.email && `(${lead.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          {appointment && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENDADO">Agendado</SelectItem>
                  <SelectItem value="REALIZADO">Realizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: Escritório, Online, Endereço do imóvel..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionais sobre o atendimento..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            {appointment && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar Atendimento
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (appointment ? 'Atualizar' : 'Agendar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};