import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, MessageSquare, Mail, User, Clock, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
}

const FazerLigacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { logActivity } = useActivityLogger();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);
  const [callNotes, setCallNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [profile]);

  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      setSelectedClientData(client || null);
    } else {
      setSelectedClientData(null);
    }
  }, [selectedClient, clients]);

  const fetchClients = async () => {
    if (!profile) return;

    try {
      let query = supabase.from('clients').select('id, name, email, phone, status, notes');
      
      if (profile.role === 'CORRETOR') {
        query = query.eq('corretor_id', profile.id);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Número copiado para a área de transferência.",
    });
  };

  const startCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      toast({
        title: "Número não disponível",
        description: "Este cliente não possui telefone cadastrado.",
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = (phone: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    } else {
      toast({
        title: "Número não disponível",
        description: "Este cliente não possui telefone cadastrado.",
        variant: "destructive",
      });
    }
  };

  const saveCallNotes = async () => {
    if (!selectedClient || !callNotes.trim()) return;

    setLoading(true);
    try {
      const currentNotes = selectedClientData?.notes || '';
      const timestamp = new Date().toLocaleString('pt-BR');
      const newNotes = `${currentNotes}\n\n[${timestamp}] Ligação: ${callNotes}`.trim();

      const { error } = await supabase
        .from('clients')
        .update({ notes: newNotes })
        .eq('id', selectedClient);

      if (error) throw error;

      // Registrar atividade
      await logActivity(
        selectedClient,
        'ligacao',
        `Ligação realizada para ${selectedClientData?.name}: ${callNotes.substring(0, 100)}${callNotes.length > 100 ? '...' : ''}`
      );

      toast({
        title: "Observações salvas!",
        description: "As observações da ligação foram registradas.",
      });
      
      setCallNotes("");
      fetchClients(); // Refresh data
    } catch (error) {
      console.error('Erro ao salvar observações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as observações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROSPECTO': return 'text-blue-600';
      case 'QUALIFICADO': return 'text-yellow-600';
      case 'INTERESSADO': return 'text-green-600';
      case 'NEGOCIACAO': return 'text-purple-600';
      default: return 'text-foreground-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PROSPECTO': return 'Potencial';
      case 'QUALIFICADO': return 'Qualificado';
      case 'INTERESSADO': return 'Interessado';
      case 'NEGOCIACAO': return 'Em Negociação';
      default: return status;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fazer Ligação</h1>
          <p className="text-foreground-muted mt-1">Entre em contato com seus clientes</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Selecionar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente para contatar" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.phone || client.email || "Sem contato"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClientData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground-muted">Nome</Label>
                <p className="text-lg font-semibold">{selectedClientData.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-foreground-muted">Status</Label>
                <p className={`text-lg font-semibold ${getStatusColor(selectedClientData.status)}`}>
                  {getStatusLabel(selectedClientData.status)}
                </p>
              </div>

              {selectedClientData.phone && (
                <div>
                  <Label className="text-sm font-medium text-foreground-muted">Telefone</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg">{selectedClientData.phone}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedClientData.phone)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedClientData.email && (
                <div>
                  <Label className="text-sm font-medium text-foreground-muted">E-mail</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg">{selectedClientData.email}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedClientData.email)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => startCall(selectedClientData.phone)}
                  className="gap-2"
                  disabled={!selectedClientData.phone}
                >
                  <Phone className="w-4 h-4" />
                  Ligar
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => openWhatsApp(selectedClientData.phone)}
                  className="gap-2"
                  disabled={!selectedClientData.phone}
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedClientData.email}`, '_self')}
                  className="gap-2"
                  disabled={!selectedClientData.email}
                >
                  <Mail className="w-4 h-4" />
                  E-mail
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Observações da Ligação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="call-notes">Registrar observações após a chamada</Label>
                <Textarea
                  id="call-notes"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Como foi a ligação? O cliente demonstrou interesse? Próximos passos..."
                  className="min-h-[120px] mt-2"
                />
              </div>
              
              <Button 
                onClick={saveCallNotes}
                disabled={!callNotes.trim() || loading}
                className="w-full"
              >
                {loading ? "Salvando..." : "Salvar Observações"}
              </Button>

              {selectedClientData.notes && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-foreground-muted">Histórico de Observações</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg max-h-48 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{selectedClientData.notes}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FazerLigacao;