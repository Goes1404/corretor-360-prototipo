import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Phone, Mail, Calendar, MoreHorizontal } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "novo" | "qualificado" | "proposta" | "negociacao" | "fechado";
  source: string;
  value: string;
  lastContact: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 99999-9999",
    status: "qualificado",
    source: "Site",
    value: "R$ 350.000",
    lastContact: "2 dias atrás"
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 88888-8888",
    status: "proposta",
    source: "Indicação",
    value: "R$ 280.000",
    lastContact: "1 dia atrás"
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(11) 77777-7777",
    status: "negociacao",
    source: "Facebook",
    value: "R$ 420.000",
    lastContact: "3 horas atrás"
  },
  {
    id: "4",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    phone: "(11) 66666-6666",
    status: "novo",
    source: "Google Ads",
    value: "R$ 180.000",
    lastContact: "5 minutos atrás"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "novo":
      return <span className="status-pending">Novo</span>;
    case "qualificado":
      return <span className="status-warning">Qualificado</span>;
    case "proposta":
      return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-full text-xs font-medium">Proposta</span>;
    case "negociacao":
      return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-1 rounded-full text-xs font-medium">Negociação</span>;
    case "fechado":
      return <span className="status-success">Fechado</span>;
    default:
      return <span className="status-pending">-</span>;
  }
};

const CRM = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = mockLeads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Inteligente</h1>
          <p className="text-foreground-muted mt-1">Gerencie seus leads e oportunidades</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-primary">247</div>
          <div className="text-sm text-foreground-muted">Total de Leads</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-warning-foreground">89</div>
          <div className="text-sm text-foreground-muted">Qualificados</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-success">34</div>
          <div className="text-sm text-foreground-muted">Convertidos</div>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="text-2xl font-bold text-primary">24.5%</div>
          <div className="text-sm text-foreground-muted">Taxa Conversão</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
          <Input
            placeholder="Buscar leads por nome ou email..."
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

      {/* Leads Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-muted">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Contato</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Origem</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Valor</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Último Contato</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr key={lead.id} className={index % 2 === 0 ? "bg-background" : "bg-background-secondary"}>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{lead.name}</div>
                    <div className="text-sm text-foreground-muted">{lead.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{lead.phone}</div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="p-4 text-sm text-foreground">{lead.source}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{lead.value}</td>
                  <td className="p-4 text-sm text-foreground-muted">{lead.lastContact}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CRM;