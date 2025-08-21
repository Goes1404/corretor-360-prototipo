import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Download, Eye, Plus, Calendar, User, Phone, Mail, FileText, AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status: string;
  source?: string;
  notes?: string;
  created_at: string;
}

interface ClientDocument {
  id: string;
  name: string;
  type: string;
  status: 'PENDENTE' | 'APROVADO' | 'VENCIDO' | 'REJEITADO';
  file_url?: string;
  due_date?: string;
  received_date?: string;
  approved_date?: string;
  notes?: string;
  created_at: string;
}

const requiredDocuments = [
  "CPF e RG",
  "Comprovante de Renda",
  "Comprovante de Residência",
  "Certidão de Nascimento/Casamento",
  "Declaração Imposto de Renda",
  "Extrato Bancário",
  "FGTS (se aplicável)",
  "Matrícula do Imóvel (se financiamento)"
];

const ClienteDetalhes = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  const [documentForm, setDocumentForm] = useState({
    name: "",
    type: "",
    due_date: "",
    notes: "",
  });

  const [clientNotes, setClientNotes] = useState("");

  const fetchClientData = async () => {
    if (!clientId) return;

    try {
      setLoading(true);

      // Buscar dados do cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);
      setClientNotes(clientData.notes || "");

      // Buscar documentos do cliente
      const { data: documentsData, error: documentsError } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData as ClientDocument[] || []);

    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !profile) return;

    try {
      const { error } = await supabase
        .from('client_documents')
        .insert([{
          client_id: clientId,
          name: documentForm.name,
          type: documentForm.type,
          due_date: documentForm.due_date || null,
          notes: documentForm.notes || null,
          status: 'PENDENTE',
        }]);

      if (error) throw error;

      toast({
        title: "Documento adicionado",
        description: "Documento adicionado à lista de pendências.",
      });

      setIsDocumentDialogOpen(false);
      setDocumentForm({ name: "", type: "", due_date: "", notes: "" });
      fetchClientData();
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: "Erro ao adicionar documento",
        description: "Não foi possível adicionar o documento.",
        variant: "destructive",
      });
    }
  };

  const updateDocumentStatus = async (documentId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'APROVADO') {
        updateData.approved_date = new Date().toISOString();
      }
      if (newStatus === 'PENDENTE' && documents.find(d => d.id === documentId)?.status !== 'PENDENTE') {
        updateData.received_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('client_documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status do documento foi atualizado.",
      });

      fetchClientData();
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do documento.",
        variant: "destructive",
      });
    }
  };

  const saveClientNotes = async () => {
    if (!clientId) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ notes: clientNotes })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Observações salvas",
        description: "As observações do cliente foram atualizadas.",
      });

      setIsNotesDialogOpen(false);
      if (client) {
        setClient({ ...client, notes: clientNotes });
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erro ao salvar observações",
        description: "Não foi possível salvar as observações.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'VENCIDO':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'REJEITADO':
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'bg-success/10 text-success border-success/20';
      case 'VENCIDO': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'REJEITADO': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning-foreground border-warning/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'Aprovado';
      case 'VENCIDO': return 'Vencido';
      case 'REJEITADO': return 'Rejeitado';
      default: return 'Pendente';
    }
  };

  const getMissingDocuments = () => {
    const existingDocTypes = documents.map(doc => doc.name);
    return requiredDocuments.filter(doc => !existingDocTypes.includes(doc));
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">Carregando dados do cliente...</div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-foreground-muted mb-4">Cliente não encontrado</p>
            <Button onClick={() => navigate('/crm')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao CRM
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const missingDocuments = getMissingDocuments();
  const documentsStats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'APROVADO').length,
    pending: documents.filter(d => d.status === 'PENDENTE').length,
    overdue: documents.filter(d => d.status === 'VENCIDO').length,
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/crm')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          <p className="text-foreground-muted mt-1">Gestão completa de documentos e informações</p>
        </div>
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Observações
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Observações Internas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Adicione observações sobre o cliente..."
                rows={6}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveClientNotes}>
                  Salvar Observações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Informações do Cliente */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Informações do Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-foreground-muted">Nome</p>
              <p className="font-medium text-foreground">{client.name}</p>
            </div>
          </div>
          
          {client.email && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-foreground-muted">Email</p>
                <p className="font-medium text-foreground">{client.email}</p>
              </div>
            </div>
          )}
          
          {client.phone && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-foreground-muted">Telefone</p>
                <p className="font-medium text-foreground">{client.phone}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-foreground-muted">Cliente desde</p>
              <p className="font-medium text-foreground">
                {new Date(client.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        
        <Badge variant="outline" className="mt-4">
          Status: {client.status}
        </Badge>
      </Card>

      {/* Estatísticas de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{documentsStats.total}</div>
            <div className="text-sm text-foreground-muted">Total de Docs</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{documentsStats.approved}</div>
            <div className="text-sm text-foreground-muted">Aprovados</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-foreground">{documentsStats.pending}</div>
            <div className="text-sm text-foreground-muted">Pendentes</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{documentsStats.overdue}</div>
            <div className="text-sm text-foreground-muted">Vencidos</div>
          </div>
        </Card>
      </div>

      {/* Documentos Faltantes */}
      {missingDocuments.length > 0 && (
        <Card className="p-6 border-l-4 border-l-warning">
          <h3 className="text-lg font-semibold text-foreground mb-3">📋 Documentos Obrigatórios Faltantes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {missingDocuments.map((doc) => (
              <div key={doc} className="flex items-center justify-between p-2 bg-warning/5 rounded">
                <span className="text-sm text-foreground">{doc}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDocumentForm({ ...documentForm, name: doc, type: doc });
                    setIsDocumentDialogOpen(true);
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de Documentos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Documentos do Cliente</h3>
          <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Documento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDocument} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Nome do Documento</Label>
                  <Input
                    id="doc-name"
                    value={documentForm.name}
                    onChange={(e) => setDocumentForm({...documentForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Tipo</Label>
                  <Select value={documentForm.type} onValueChange={(value) => setDocumentForm({...documentForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {requiredDocuments.map((doc) => (
                        <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                      ))}
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-due-date">Prazo</Label>
                  <Input
                    id="doc-due-date"
                    type="date"
                    value={documentForm.due_date}
                    onChange={(e) => setDocumentForm({...documentForm, due_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-notes">Observações</Label>
                  <Textarea
                    id="doc-notes"
                    value={documentForm.notes}
                    onChange={(e) => setDocumentForm({...documentForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Adicionar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-muted">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Documento</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Prazo</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Recebido</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={doc.id} className={index % 2 === 0 ? "bg-background" : "bg-background-secondary"}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <div>
                        <div className="font-medium text-foreground">{doc.name}</div>
                        {doc.notes && (
                          <div className="text-xs text-foreground-muted">{doc.notes}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(doc.status)}>
                      {getStatusText(doc.status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">
                      {doc.due_date 
                        ? new Date(doc.due_date).toLocaleDateString('pt-BR')
                        : "-"
                      }
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground-muted">
                      {doc.received_date 
                        ? new Date(doc.received_date).toLocaleDateString('pt-BR')
                        : "-"
                      }
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Select 
                        value={doc.status} 
                        onValueChange={(value) => updateDocumentStatus(doc.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDENTE">Pendente</SelectItem>
                          <SelectItem value="APROVADO">Aprovar</SelectItem>
                          <SelectItem value="REJEITADO">Rejeitar</SelectItem>
                          <SelectItem value="VENCIDO">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Upload className="w-4 h-4" />
                      </Button>
                      
                      {doc.file_url && (
                        <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-foreground-muted">Nenhum documento cadastrado ainda.</p>
            <Button onClick={() => setIsDocumentDialogOpen(true)} className="mt-4">
              Adicionar Primeiro Documento
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClienteDetalhes;