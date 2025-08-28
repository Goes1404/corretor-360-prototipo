import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "./useActivityLogger";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  status_negociacao: 'novo_lead' | 'contato_realizado' | 'visita_agendada' | 'proposta_enviada' | 'contrato_assinado';
  source?: string;
  notes?: string;
  qualificado: boolean;
  created_at: string;
  updated_at: string;
  corretor_id: string;
}

export const useLeads = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'qualified' | 'unqualified'>('all');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      // Se não for gestor, filtrar apenas os leads do corretor
      if (profile?.role !== 'GESTOR') {
        query = query.eq('corretor_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar leads:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os leads",
          variant: "destructive"
        });
        return;
      }

      setLeads((data as Lead[]) || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const qualifyLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ qualificado: true })
        .eq('id', leadId);

      if (error) throw error;

      // Registrar atividade
      await logActivity(leadId, 'qualificacao', 'Lead qualificado pelo corretor');

      // Atualizar estado local
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, qualificado: true } : lead
      ));

      toast({
        title: "Sucesso",
        description: "Lead qualificado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao qualificar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível qualificar o lead",
        variant: "destructive"
      });
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      // Atualizar estado local
      setLeads(prev => prev.filter(lead => lead.id !== leadId));

      toast({
        title: "Sucesso",
        description: "Lead excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lead",
        variant: "destructive"
      });
    }
  };

  const makePhoneCall = async (leadId: string, phone: string) => {
    try {
      // Registrar atividade
      await logActivity(leadId, 'ligacao', `Ligação realizada para ${phone}`);
      
      // Atualizar status para contato_realizado se ainda for novo_lead
      const lead = leads.find(l => l.id === leadId);
      if (lead?.status_negociacao === 'novo_lead') {
        const { error } = await supabase
          .from('clients')
          .update({ status_negociacao: 'contato_realizado' })
          .eq('id', leadId);

        if (!error) {
          setLeads(prev => prev.map(l => 
            l.id === leadId ? { ...l, status_negociacao: 'contato_realizado' } : l
          ));
        }
      }

      // Abrir discador (tenta tel: primeiro, depois copia para clipboard)
      if (navigator.userAgent.includes('Mobile')) {
        window.open(`tel:${phone.replace(/\D/g, '')}`, '_self');
      } else {
        await navigator.clipboard.writeText(phone);
        toast({
          title: "Número copiado",
          description: "O número foi copiado para a área de transferência"
        });
      }
    } catch (error) {
      console.error('Erro ao fazer ligação:', error);
    }
  };

  const sendEmail = async (leadId: string, email: string, subject: string, message: string) => {
    try {
      // Registrar atividade
      await logActivity(leadId, 'email', `E-mail enviado: ${subject}`);
      
      // Atualizar status para contato_realizado se ainda for novo_lead
      const lead = leads.find(l => l.id === leadId);
      if (lead?.status_negociacao === 'novo_lead') {
        const { error } = await supabase
          .from('clients')
          .update({ status_negociacao: 'contato_realizado' })
          .eq('id', leadId);

        if (!error) {
          setLeads(prev => prev.map(l => 
            l.id === leadId ? { ...l, status_negociacao: 'contato_realizado' } : l
          ));
        }
      }

      toast({
        title: "Sucesso",
        description: "Atividade de e-mail registrada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao registrar envio de e-mail:', error);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchLeads();
    }
  }, [profile?.id]);

  // Real-time updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('leads-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const filteredLeads = leads.filter(lead => {
    if (filter === 'qualified') return lead.qualificado;
    if (filter === 'unqualified') return !lead.qualificado;
    return true;
  });

  return {
    leads: filteredLeads,
    loading,
    filter,
    setFilter,
    qualifyLead,
    deleteLead,
    makePhoneCall,
    sendEmail,
    refreshLeads: fetchLeads
  };
};