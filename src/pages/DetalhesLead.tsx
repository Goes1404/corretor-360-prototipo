import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Activity, 
  Calendar,
  Download,
  Upload,
  Eye
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  status: string;
  status_negociacao?: string;
  qualificado: boolean;
  desqualificado: boolean;
  motivo_desqualificacao?: string;
  observacoes_desqualificacao?: string;
  notes?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  file_url?: string;
  received_date?: string;
  due_date?: string;
  approved_date?: string;
  notes?: string;
}

interface Activity {
  id: string;
  tipo_atividade: string;
  descricao: string;
  data_hora: string;
}

interface Appointment {
  id: string;
  title: string;
  date_time: string;
  status: string;
  location?: string;
  notes?: string;
}

const DetalhesLead = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch lead details
      const { data: leadData, error: leadError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadError) throw leadError;
      setLead(leadData);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from("client_documents")
        .select("*")
        .eq("client_id", leadId)
        .order("created_at", { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .eq("client_id", leadId)
        .order("data_hora", { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", leadId)
        .order("date_time", { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
      
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do lead",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROSPECTO": return "bg-blue-100 text-blue-800";
      case "QUALIFICADO": return "bg-green-100 text-green-800";
      case "PROPOSTA": return "bg-yellow-100 text-yellow-800";
      case "VENDIDO": return "bg-emerald-100 text-emerald-800";
      case "PERDIDO": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "APROVADO": return "bg-green-100 text-green-800";
      case "PENDENTE": return "bg-yellow-100 text-yellow-800";
      case "REJEITADO": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/crm")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-8">Carregando...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/crm")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-8">Lead não encontrado</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/crm")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Detalhes do Lead</h1>
          <p className="text-foreground-muted">{lead.name}</p>
        </div>
      </div>

      {/* Lead Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground-muted">Nome</label>
              <p className="text-foreground">{lead.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">Email</label>
              <p className="text-foreground">{lead.email || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">Telefone</label>
              <p className="text-foreground">{lead.phone || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">CPF</label>
              <p className="text-foreground">{lead.cpf || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">Status</label>
              <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">Fonte</label>
              <p className="text-foreground">{lead.source || "Não informado"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground-muted">Qualificação</label>
              <div className="flex gap-2">
                {lead.qualificado && <Badge className="bg-green-100 text-green-800">Qualificado</Badge>}
                {lead.desqualificado && <Badge className="bg-red-100 text-red-800">Desqualificado</Badge>}
                {!lead.qualificado && !lead.desqualificado && <Badge variant="outline">Não qualificado</Badge>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">Criado em</label>
              <p className="text-foreground">{formatDate(lead.created_at)}</p>
            </div>
          </div>

          {lead.motivo_desqualificacao && (
            <div>
              <label className="text-sm font-medium text-foreground-muted">Motivo da Desqualificação</label>
              <p className="text-foreground">{lead.motivo_desqualificacao}</p>
              {lead.observacoes_desqualificacao && (
                <p className="text-foreground-muted text-sm mt-1">{lead.observacoes_desqualificacao}</p>
              )}
            </div>
          )}

          {lead.notes && (
            <div>
              <label className="text-sm font-medium text-foreground-muted">Observações</label>
              <p className="text-foreground">{lead.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Atividades ({activities.length})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Agendamentos ({appointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center py-8 text-foreground-muted">Nenhum documento encontrado</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{doc.name}</h4>
                          <Badge className={getDocumentStatusColor(doc.status)}>{doc.status}</Badge>
                        </div>
                        <p className="text-sm text-foreground-muted">Tipo: {doc.type}</p>
                        {doc.due_date && (
                          <p className="text-sm text-foreground-muted">
                            Vencimento: {formatDateOnly(doc.due_date)}
                          </p>
                        )}
                        {doc.notes && (
                          <p className="text-sm text-foreground-muted mt-1">{doc.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {doc.file_url && (
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center py-8 text-foreground-muted">Nenhuma atividade encontrada</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{activity.tipo_atividade.replace("_", " ")}</h4>
                        <span className="text-sm text-foreground-muted">
                          {formatDate(activity.data_hora)}
                        </span>
                      </div>
                      <p className="text-foreground-muted text-sm mt-1">{activity.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center py-8 text-foreground-muted">Nenhum agendamento encontrado</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{appointment.title}</h4>
                        <Badge variant={appointment.status === "AGENDADO" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-foreground-muted text-sm">
                        {formatDate(appointment.date_time)}
                      </p>
                      {appointment.location && (
                        <p className="text-foreground-muted text-sm">Local: {appointment.location}</p>
                      )}
                      {appointment.notes && (
                        <p className="text-foreground-muted text-sm mt-1">{appointment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetalhesLead;