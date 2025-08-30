import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";

const NovoLead = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { logActivity } = useActivityLogger();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "PROSPECTO" as const,
    monthly_income: "",
    profession: "",
    desired_property_type: "",
    interest_location: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar duplicidade antes de cadastrar
    if (formData.email || formData.phone) {
      try {
        let duplicateQuery = supabase
          .from('clients')
          .select('id, name, email, phone');

        if (formData.email && formData.phone) {
          duplicateQuery = duplicateQuery.or(`email.eq.${formData.email},phone.eq.${formData.phone}`);
        } else if (formData.email) {
          duplicateQuery = duplicateQuery.eq('email', formData.email);
        } else if (formData.phone) {
          duplicateQuery = duplicateQuery.eq('phone', formData.phone);
        }

        const { data: duplicates, error: duplicateError } = await duplicateQuery;

        if (duplicateError) {
          console.error('Erro ao verificar duplicidade:', duplicateError);
        } else if (duplicates && duplicates.length > 0) {
          const duplicate = duplicates[0];
          toast({
            title: "Lead já cadastrado",
            description: `Já existe um lead com estes dados: ${duplicate.name}`,
            variant: "destructive"
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar duplicidade:', error);
      }
    }
    if (!profile) return;

    setLoading(true);
    try {
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          name: formData.name || 'Lead sem nome',
          email: formData.email || null,
          phone: formData.phone || null,
          status: formData.status,
          status_negociacao: 'novo_lead',
          notes: formData.notes || null,
          corretor_id: profile.id,
          source: 'CADASTRO_MANUAL'
        })
        .select()
        .single();

      if (error) throw error;

      // Registrar atividade
      await logActivity(
        newClient.id,
        'novo_lead',
        `Novo lead cadastrado: ${formData.name || 'Lead sem nome'}`
      );

      toast({
        title: "Lead cadastrado!",
        description: "O novo lead foi adicionado com sucesso.",
      });
      
      navigate("/crm");
    } catch (error) {
      console.error('Erro ao cadastrar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Novo Lead</h1>
          <p className="text-foreground-muted mt-1 text-sm sm:text-base">Cadastre um novo prospect</p>
        </div>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Informações do Lead
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROSPECTO">Potencial</SelectItem>
                    <SelectItem value="QUALIFICADO">Frio</SelectItem>
                    <SelectItem value="INTERESSADO">Quente</SelectItem>
                    <SelectItem value="NEGOCIACAO">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthly_income">Renda Mensal Estimada</Label>
                <Input
                  id="monthly_income"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                  placeholder="R$ 5.000,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profession">Profissão</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="Ex: Engenheiro, Médico, Advogado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desired_property_type">Tipo de Imóvel Desejado</Label>
                <Input
                  id="desired_property_type"
                  value={formData.desired_property_type}
                  onChange={(e) => setFormData({ ...formData, desired_property_type: e.target.value })}
                  placeholder="Ex: Apartamento, Casa, Comercial"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interest_location">Localização de Interesse</Label>
                <Input
                  id="interest_location"
                  value={formData.interest_location}
                  onChange={(e) => setFormData({ ...formData, interest_location: e.target.value })}
                  placeholder="Ex: Centro, Zona Sul, Bairro específico"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações Gerais</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais sobre o lead..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button type="submit" disabled={loading} className="gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" />
                {loading ? "Salvando..." : "Salvar Lead"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovoLead;