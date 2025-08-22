import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useActivityLogger = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const logActivity = async (
    clientId: string,
    tipoAtividade: string,
    descricao: string
  ) => {
    if (!profile?.id) {
      console.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: profile.id,
          client_id: clientId,
          tipo_atividade: tipoAtividade,
          descricao: descricao
        });

      if (error) {
        console.error('Erro ao registrar atividade:', error);
        toast({
          title: "Erro",
          description: "Não foi possível registrar a atividade",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      return false;
    }
  };

  return { logActivity };
};