import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "./useActivityLogger";

export interface Appointment {
  id: string;
  client_id: string;
  corretor_id: string;
  title: string;
  date_time: string;
  location?: string;
  notes?: string;
  status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO';
  created_at: string;
  updated_at: string;
  // Dados do cliente (buscar separadamente se necessário)
  clientName?: string;
}

export const useAppointments = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('appointments')
        .select('*')
        .order('date_time', { ascending: true });

      // Se não for gestor, filtrar apenas os agendamentos do corretor
      if (profile?.role !== 'GESTOR') {
        query = query.eq('corretor_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os agendamentos",
          variant: "destructive"
        });
        return;
      }

      setAppointments(data as Appointment[] || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: {
    client_id: string;
    title: string;
    date_time: string;
    location?: string;
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          corretor_id: profile?.id
        });

      if (error) throw error;

      // Registrar atividade
      await logActivity(appointmentData.client_id, 'agendamento', `Atendimento agendado: ${appointmentData.title}`);

      await fetchAppointments();

      toast({
        title: "Sucesso",
        description: "Atendimento agendado com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar o atendimento",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchAppointments();

      toast({
        title: "Sucesso",
        description: "Atendimento atualizado com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o atendimento",
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'CANCELADO' })
        .eq('id', id);

      if (error) throw error;

      await fetchAppointments();

      toast({
        title: "Sucesso",
        description: "Atendimento cancelado"
      });

      return true;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o atendimento",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchAppointments();
    }
  }, [profile?.id]);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refreshAppointments: fetchAppointments
  };
};