import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FunnelData {
  status: string;
  count: number;
  label: string;
  color: string;
  borderColor: string;
}

export function SalesFunnel() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(false);

  const statusConfig = {
    novo_lead: { label: "Novos Leads", color: "bg-primary/5", borderColor: "border-primary" },
    contato_realizado: { label: "Contato Realizado", color: "bg-blue/5", borderColor: "border-blue" },
    visita_agendada: { label: "Visita Agendada", color: "bg-warning/5", borderColor: "border-warning" },
    proposta_enviada: { label: "Proposta Enviada", color: "bg-orange/5", borderColor: "border-orange" },
    em_negociacao: { label: "Em Negociação", color: "bg-indigo/5", borderColor: "border-indigo" },
    contrato_assinado: { label: "Contrato Assinado", color: "bg-success/5", borderColor: "border-success" },
    venda_concluida: { label: "Vendas Finalizadas", color: "bg-emerald/5", borderColor: "border-emerald" }
  };

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('clients')
        .select('status_negociacao, corretor_id');

      // Se não for gestor, filtrar apenas os leads do corretor
      if (profile?.role !== 'GESTOR') {
        query = query.eq('corretor_id', profile?.id);
      }

      const { data: clients, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados do funil:', error);
        return;
      }

      // Contar leads por status
      const statusCounts = clients?.reduce((acc, client) => {
        const status = client.status_negociacao || 'novo_lead';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const total = clients?.length || 0;
      setTotalLeads(total);

      // Criar dados do funil
      const funnel = Object.entries(statusConfig).map(([status, config]) => ({
        status,
        count: statusCounts[status] || 0,
        label: config.label,
        color: config.color,
        borderColor: config.borderColor
      }));

      setFunnelData(funnel);
    } catch (error) {
      console.error('Erro ao carregar funil de vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchFunnelData();
    }
  }, [profile?.id, profile?.role]);

  // Real-time updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('funnel-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          fetchFunnelData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const calculatePercentage = (count: number) => {
    return totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Funil de Vendas</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-secondary rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Funil de Vendas</h3>
        <span className="text-sm text-foreground-muted">
          Total: {totalLeads} leads
        </span>
      </div>
      
      <div className="space-y-3">
        {funnelData.map((item) => {
          const percentage = calculatePercentage(item.count);
          const width = totalLeads > 0 ? Math.max((item.count / totalLeads) * 100, 5) : 0;
          
          return (
            <div 
              key={item.status} 
              className={`flex items-center justify-between p-3 rounded-lg ${item.color} border-l-4 ${item.borderColor} transition-all hover:shadow-sm cursor-pointer`}
              onClick={() => {
                if (item.status === 'venda_concluida') {
                  navigate('/vendas-finalizadas');
                }
              }}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <span className="text-sm text-foreground-muted">{percentage}%</span>
                </div>
                <div className="w-full bg-background-muted rounded-full h-1.5 mb-1">
                  <div 
                    className="bg-current h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${width}%` }}
                  ></div>
                </div>
                <p className="text-sm text-foreground-muted">
                  {item.count} {item.count === 1 ? 'lead' : 'leads'}
                </p>
              </div>
              <span className="text-2xl font-bold ml-4">{item.count}</span>
            </div>
          );
        })}
      </div>
      
      {totalLeads === 0 && (
        <div className="text-center py-8">
          <p className="text-foreground-muted">Nenhum lead encontrado</p>
          <p className="text-sm text-foreground-muted mt-1">
            Comece adicionando novos leads ao sistema
          </p>
        </div>
      )}
    </div>
  );
}