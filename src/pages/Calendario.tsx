import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MapPin, Calendar as CalendarIcon, Users, CheckCircle, XCircle } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentModal } from "@/components/Calendar/AppointmentModal";
import { DayPicker } from "react-day-picker";

const Calendario = () => {
  const { appointments, loading } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const appointmentsForSelectedDate = appointments.filter(apt => 
    isSameDay(parseISO(apt.date_time), selectedDate)
  );

  // Dias com agendamentos para destacar no calendário
  const appointmentDates = appointments.map(apt => parseISO(apt.date_time));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO': return 'bg-primary';
      case 'REALIZADO': return 'bg-green-500';
      case 'CANCELADO': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AGENDADO': return <Clock className="w-4 h-4" />;
      case 'REALIZADO': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELADO': return <XCircle className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
  };

  if (loading) {
    return <div className="animate-pulse">Carregando calendário...</div>;
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Calendário de Atendimentos</h1>
          <p className="text-foreground-muted mt-1 text-sm sm:text-base">Gerencie seus agendamentos e compromissos</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span className="sm:inline">Novo Atendimento</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="w-5 h-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border w-full pointer-events-auto mx-auto"
              modifiers={{
                hasAppointment: appointmentDates
              }}
              modifiersStyles={{
                hasAppointment: { 
                  backgroundColor: 'hsl(120, 60%, 50%)', 
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              <span className="truncate">
                Atendimentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </CardTitle>
            <CardDescription>
              {appointmentsForSelectedDate.length} compromisso(s) para esta data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {appointmentsForSelectedDate.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">Nenhum atendimento</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Não há compromissos agendados para esta data.
                </p>
              </div>
            ) : (
              appointmentsForSelectedDate.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEditAppointment(appointment)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(appointment.date_time), "HH:mm")}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground">{appointment.title}</h4>
                        <p className="text-sm text-foreground-muted">
                          Cliente: {appointment.clientName || 'Cliente não informado'}
                        </p>
                        {appointment.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {appointment.location}
                            </span>
                          </div>
                        )}
                        {appointment.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <AppointmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        appointment={editingAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Calendario;