import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, FileText, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const UploadDocumentos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { id: "RG_CNH", name: "RG ou CNH", required: true },
    { id: "CPF", name: "CPF", required: true },
    { id: "COMPROVANTE_RESIDENCIA", name: "Comprovante de Residência", required: true },
    { id: "COMPROVANTE_RENDA", name: "Comprovante de Renda", required: true },
    { id: "CERTIDAO_CIVIL", name: "Certidão de Estado Civil", required: true },
    { id: "EXTRATO_BANCARIO", name: "Extrato Bancário", required: true },
    { id: "DECLARACAO_IR", name: "Declaração de Imposto de Renda", required: true },
    { id: "OUTROS", name: "Outros Documentos", required: false },
  ];

  useEffect(() => {
    fetchClients();
  }, [profile]);

  const fetchClients = async () => {
    if (!profile) return;

    try {
      let query = supabase.from('clients').select('id, name, email, phone');
      
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

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!selectedClient) return;

    setLoading(true);
    try {
      // Simulate file storage - in real implementation, you'd upload to Supabase Storage
      const { error } = await supabase
        .from('client_documents')
        .upsert({
          client_id: selectedClient,
          type: documentType,
          name: file.name,
          status: 'RECEBIDO',
          received_date: new Date().toISOString(),
          file_url: `documents/${selectedClient}/${file.name}` // Placeholder URL
        });

      if (error) throw error;

      toast({
        title: "Documento enviado!",
        description: `${file.name} foi enviado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o documento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsReceived = async (documentType: string) => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('client_documents')
        .upsert({
          client_id: selectedClient,
          type: documentType,
          name: `${documentType} - Recebido manualmente`,
          status: 'RECEBIDO',
          received_date: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Documento marcado como recebido!",
        description: `${documentType} foi marcado como recebido.`,
      });
    } catch (error) {
      console.error('Erro ao marcar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o documento.",
        variant: "destructive",
      });
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
          <h1 className="text-3xl font-bold text-foreground">Upload de Documentos</h1>
          <p className="text-foreground-muted mt-1">Envie documentos dos seus clientes</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Selecionar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente para enviar documentos" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.email || client.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient && (
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos Necessários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentTypes.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-foreground-muted" />
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      {doc.required && (
                        <p className="text-sm text-foreground-muted">Documento obrigatório</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsReceived(doc.id)}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Marcar como Recebido
                    </Button>
                    
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-${doc.id}`}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(doc.id, file);
                          }
                        }}
                        disabled={loading}
                      />
                      <Button size="sm" disabled={loading} className="gap-2">
                        <Upload className="w-4 h-4" />
                        {loading ? "Enviando..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadDocumentos;