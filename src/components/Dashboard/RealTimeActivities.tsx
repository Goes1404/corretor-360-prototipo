import { useEffect, useState } from "react";
import { Clock, User, FileText, Phone, CheckCircle, Mail, Calendar, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
  id: string;
  tipo_atividade: string;
  descricao: string;
  data_hora: string;
  clients: {
    name: string;
  };
  profiles: {
    full_name: string;
  };
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "novo_lead":
      return User;
    case "documento":
      return FileText;
    case "ligacao":
      return Phone;
    case "proposta":
      return CheckCircle;
    case "email":
      return Mail;
    case "visita":
      return Calendar;
    case "atualizacao":
      return Edit;
    default:
      return Clock;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "novo_lead":
      return "text-primary";
    case "documento":
      return "text-blue";
    case "ligacao":
      return "text-warning";
    case "proposta":
      return "text-success";
    case "email":
      return "text-purple";
    case "visita":
      return "text-orange";
    case "atualizacao":
      return "text-gray";
    default:
      return "text-foreground-muted";
  }
};

export function RealTimeActivities() {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('activities')
        .select(`
          id,
          tipo_atividade,
          descricao,
          data_hora,
          clients!inner(name),
          profiles!inner(full_name)
        `)
        .order('data_hora', { ascending: false })
        .limit(10);

      // Se não for gestor, filtrar apenas atividades dos leads do corretor
      if (profile?.role !== 'GESTOR') {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar atividades:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchActivities();
    }
  }, [profile?.id, profile?.role]);

  // Real-time updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('activities-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Atividades Recentes</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-secondary rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary rounded w-3/4"></div>
                <div className="h-3 bg-secondary rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Atividades Recentes</h3>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.tipo_atividade);
            const iconColor = getActivityColor(activity.tipo_atividade);
            
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-background-muted transition-colors"
              >
                <div className={`w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.descricao}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-foreground-muted">
                          {activity.profiles.full_name}
                        </span>
                        <span className="text-xs text-foreground-muted">•</span>
                        <span className="text-xs text-foreground-muted">
                          {activity.clients.name}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-xs text-foreground-muted whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.data_hora), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
            <p className="text-foreground-muted">Nenhuma atividade recente</p>
            <p className="text-sm text-foreground-muted mt-1">
              As atividades aparecerão aqui conforme você interagir com os leads
            </p>
          </div>
        )}
      </div>
    </div>
  );
}