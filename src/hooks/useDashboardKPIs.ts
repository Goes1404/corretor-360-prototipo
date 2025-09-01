import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DashboardKPIs {
  leadsAtivos: number;
  propostasEnviadas: number;
  taxaConversao: number;
  vendasMes: number;
  docsPendentes: number;
  scorePerformance: number;
  loading: boolean;
}

export const useDashboardKPIs = () => {
  const { profile } = useAuth();
  const [kpis, setKPIs] = useState<DashboardKPIs>({
    leadsAtivos: 0,
    propostasEnviadas: 0,
    taxaConversao: 0,
    vendasMes: 0,
    docsPendentes: 0,
    scorePerformance: 0,
    loading: true
  });

  const fetchKPIs = async () => {
    if (!profile?.id) return;

    try {
      setKPIs(prev => ({ ...prev, loading: true }));

      // Query para leads ativos
      let leadsQuery = supabase
        .from('clients')
        .select('id, status_negociacao')
        .neq('status_negociacao', 'venda_concluida')
        .neq('desqualificado', true);

      // Query para propostas enviadas
      let propostasQuery = supabase
        .from('clients')
        .select('id')
        .eq('status_negociacao', 'proposta_enviada');

      // Query para vendas finalizadas
      let vendasQuery = supabase
        .from('sales_finalized')
        .select('sale_value');

      // Query para documentos pendentes
      let docsQuery = supabase
        .from('client_documents')
        .select('id')
        .eq('status', 'PENDENTE');

      // Se não for gestor, filtrar apenas dados do corretor
      if (profile.role !== 'GESTOR') {
        leadsQuery = leadsQuery.eq('corretor_id', profile.id);
        propostasQuery = propostasQuery.eq('corretor_id', profile.id);
        vendasQuery = vendasQuery.eq('corretor_id', profile.id);
        
        // Buscar client_ids do corretor primeiro
        const { data: clientIds } = await supabase
          .from('clients')
          .select('id')
          .eq('corretor_id', profile.id);
        
        const ids = clientIds?.map(c => c.id) || [];
        if (ids.length > 0) {
          docsQuery = docsQuery.in('client_id', ids);
        }
      }

      const [
        { data: leads, error: leadsError },
        { data: propostas, error: propostasError },
        { data: vendas, error: vendasError },
        { data: docs, error: docsError }
      ] = await Promise.all([
        leadsQuery,
        propostasQuery,
        vendasQuery,
        docsQuery
      ]);

      if (leadsError) console.error('Erro ao buscar leads:', leadsError);
      if (propostasError) console.error('Erro ao buscar propostas:', propostasError);
      if (vendasError) console.error('Erro ao buscar vendas:', vendasError);
      if (docsError) console.error('Erro ao buscar documentos:', docsError);

      // Calcular KPIs
      const totalLeads = leads?.length || 0;
      const totalPropostas = propostas?.length || 0;
      const totalVendas = vendas?.reduce((sum, venda) => sum + (venda.sale_value || 0), 0) || 0;
      const totalDocs = docs?.length || 0;

      // Calcular taxa de conversão
      const leadsComVenda = leads?.filter(lead => lead.status_negociacao === 'venda_concluida').length || 0;
      const taxaConversao = totalLeads > 0 ? (leadsComVenda / totalLeads) * 100 : 0;

      // Score de performance simplificado
      const scorePerformance = Math.min(10, (taxaConversao / 10) + (totalVendas / 100000) + (totalLeads / 50));

      setKPIs({
        leadsAtivos: totalLeads,
        propostasEnviadas: totalPropostas,
        taxaConversao: Math.round(taxaConversao * 10) / 10,
        vendasMes: totalVendas,
        docsPendentes: totalDocs,
        scorePerformance: Math.round(scorePerformance * 10) / 10,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
      setKPIs(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchKPIs();
    }
  }, [profile?.id, profile?.role]);

  // Real-time updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('kpis-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          fetchKPIs();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_finalized'
        },
        () => {
          fetchKPIs();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_documents'
        },
        () => {
          fetchKPIs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return kpis;
};