import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Download, CheckCircle, Clock, AlertTriangle, Search, Filter } from "lucide-react";

interface Document {
  id: string;
  client: string;
  type: string;
  status: "pendente" | "recebido" | "aprovado" | "vencido";
  dueDate: string;
  receivedDate?: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    client: "Maria Silva",
    type: "CPF e RG",
    status: "aprovado",
    dueDate: "2024-01-15",
    receivedDate: "2024-01-10"
  },
  {
    id: "2",
    client: "João Santos",
    type: "Comprovante de Renda",
    status: "recebido",
    dueDate: "2024-01-20",
    receivedDate: "2024-01-18"
  },
  {
    id: "3",
    client: "Ana Costa",
    type: "Certidão de Nascimento",
    status: "pendente",
    dueDate: "2024-01-25"
  },
  {
    id: "4",
    client: "Carlos Oliveira",
    type: "Declaração IR",
    status: "vencido",
    dueDate: "2024-01-05"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "aprovado":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "recebido":
      return <Clock className="w-4 h-4 text-warning-foreground" />;
    case "pendente":
      return <Clock className="w-4 h-4 text-foreground-muted" />;
    case "vencido":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "aprovado":
      return <span className="status-success">Aprovado</span>;
    case "recebido":
      return <span className="status-warning">Recebido</span>;
    case "pendente":
      return <span className="status-pending">Pendente</span>;
    case "vencido":
      return <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded-full text-xs font-medium">Vencido</span>;
    default:
      return <span className="status-pending">-</span>;
  }
};

const Documentos = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: mockDocuments.length,
    pendente: mockDocuments.filter(d => d.status === "pendente").length,
    recebido: mockDocuments.filter(d => d.status === "recebido").length,
    vencido: mockDocuments.filter(d => d.status === "vencido").length
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Documentos</h1>
          <p className="text-foreground-muted mt-1">Controle e acompanhe todos os documentos dos seus clientes</p>
        </div>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Documento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-foreground-muted">Total de Docs</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-foreground-muted">{stats.pendente}</div>
          <div className="text-sm text-foreground-muted">Pendentes</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-warning-foreground">{stats.recebido}</div>
          <div className="text-sm text-foreground-muted">Recebidos</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{stats.vencido}</div>
          <div className="text-sm text-foreground-muted">Vencidos</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Checklists Padrão</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="text-left">
              <div className="font-medium">Financiamento Imobiliário</div>
              <div className="text-xs text-foreground-muted">12 documentos essenciais</div>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="text-left">
              <div className="font-medium">Seguro de Vida</div>
              <div className="text-xs text-foreground-muted">8 documentos necessários</div>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="text-left">
              <div className="font-medium">Conta Investimentos</div>
              <div className="text-xs text-foreground-muted">6 documentos obrigatórios</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
          <Input
            placeholder="Buscar por cliente ou tipo de documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Documents Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-muted">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Documento</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Prazo</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Data Recebimento</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, index) => (
                <tr key={doc.id} className={index % 2 === 0 ? "bg-background" : "bg-background-secondary"}>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{doc.client}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm text-foreground">{doc.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">
                      {new Date(doc.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground-muted">
                      {doc.receivedDate 
                        ? new Date(doc.receivedDate).toLocaleDateString('pt-BR')
                        : "-"
                      }
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Upload Area */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Área de Upload</h3>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">Arraste e solte seus arquivos aqui</p>
          <p className="text-sm text-foreground-muted mb-4">ou clique para selecionar arquivos</p>
          <Button>Selecionar Arquivos</Button>
        </div>
      </div>
    </div>
  );
};

export default Documentos;