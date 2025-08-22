import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface EmailHistory {
  id: string;
  subject: string;
  content: string;
  sent_at: string;
  sender_name: string;
}

const EnviarEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { logActivity } = useActivityLogger();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [profile]);

  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      setSelectedClientData(client || null);
      fetchEmailHistory(selectedClient);
    } else {
      setSelectedClientData(null);
      setEmailHistory([]);
    }
  }, [selectedClient, clients]);

  const fetchClients = async () => {
    if (!profile) return;

    try {
      let query = supabase.from('clients').select('id, name, email, phone, notes');
      
      if (profile.role === 'CORRETOR') {
        query = query.eq('corretor_id', profile.id);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setClients(data?.filter(client => client.email) || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      });
    }
  };

  const fetchEmailHistory = async (clientId: string) => {
    try {
      // This would typically join with a emails table and profiles table
      // For now, we'll simulate with client notes that contain email records
      const { data, error } = await supabase
        .from('clients')
        .select('notes')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      // Parse email history from notes (simplified approach)
      const notes = data?.notes || '';
      const emailMatches = notes.match(/\[.*?\] E-mail:.*?(?=\[|$)/gs) || [];
      
      const emails: EmailHistory[] = emailMatches.map((match, index) => {
        const dateMatch = match.match(/\[(.*?)\]/);
        const contentMatch = match.replace(/\[.*?\] E-mail: /, '');
        
        return {
          id: `${index}`,
          subject: contentMatch.split('\n')[0] || 'Sem assunto',
          content: contentMatch,
          sent_at: dateMatch ? dateMatch[1] : 'Data não disponível',
          sender_name: profile?.full_name || 'Usuário'
        };
      });

      setEmailHistory(emails);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  const sendEmail = async () => {
    if (!selectedClient || !selectedClientData?.email || !subject.trim() || !content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o assunto e o conteúdo do e-mail.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would send the email via an email service
      // For now, we'll save it to the client's notes
      const timestamp = new Date().toLocaleString('pt-BR');
      const emailRecord = `[${timestamp}] E-mail: ${subject}\n${content}`;
      
      const currentNotes = selectedClientData.notes || '';
      const newNotes = `${currentNotes}\n\n${emailRecord}`.trim();

      // Update client notes with email record
      const { error } = await supabase
        .from('clients')
        .update({ notes: newNotes })
        .eq('id', selectedClient);

      if (error) throw error;

      // Registrar atividade
      await logActivity(
        selectedClient,
        'email',
        `E-mail enviado para ${selectedClientData.name}: ${subject}`
      );

      toast({
        title: "E-mail enviado!",
        description: `E-mail enviado para ${selectedClientData.name} com sucesso.`,
      });
      
      // Clear form
      setSubject("");
      setContent("");
      
      // Refresh email history
      fetchEmailHistory(selectedClient);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-foreground">Enviar E-mail</h1>
          <p className="text-foreground-muted mt-1">Envie e-mails para seus clientes</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Selecionar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente com e-mail cadastrado" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClientData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Compor E-mail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Para:</Label>
                  <Input
                    id="recipient"
                    value={`${selectedClientData.name} <${selectedClientData.email}>`}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Assunto do e-mail"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Mensagem *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                    className="min-h-[200px] mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={sendEmail}
                    disabled={loading || !subject.trim() || !content.trim()}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? "Enviando..." : "Enviar E-mail"}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSubject("");
                      setContent("");
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Histórico
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? "Ocultar" : "Mostrar"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showHistory && (
                <CardContent>
                  {emailHistory.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {emailHistory.map((email) => (
                        <div key={email.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{email.subject}</h4>
                          <p className="text-xs text-foreground-muted mt-1">
                            {email.sent_at}
                          </p>
                          <p className="text-sm mt-2 line-clamp-3">
                            {email.content.replace(email.subject, '').trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground-muted text-center py-4">
                      Nenhum e-mail enviado ainda
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnviarEmail;