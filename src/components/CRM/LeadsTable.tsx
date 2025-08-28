import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MoreHorizontal, Star, Trash, Search, Filter } from "lucide-react";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadsTableProps {
  showStats?: boolean;
}

export function LeadsTable({ showStats = true }: LeadsTableProps) {
  const { leads, loading, filter, setFilter, qualifyLead, deleteLead, makePhoneCall, sendEmail } = useLeads();
  const [searchTerm, setSearchTerm] = useState("");
  const [emailDialog, setEmailDialog] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [emailData, setEmailData] = useState({ subject: "", message: "" });

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.phone && lead.phone.includes(searchTerm))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "novo_lead":
        return <Badge variant="secondary">Novo Lead</Badge>;
      case "contato_realizado":
        return <Badge variant="default">Contato Realizado</Badge>;
      case "visita_agendada":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Visita Agendada</Badge>;
      case "proposta_enviada":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Proposta Enviada</Badge>;
      case "contrato_assinado":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Contrato Assinado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const handleEmailSend = async () => {
    if (emailDialog.lead) {
      await sendEmail(emailDialog.lead.id, emailDialog.lead.email || '', emailData.subject, emailData.message);
      setEmailDialog({ open: false, lead: null });
      setEmailData({ subject: "", message: "" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.lead) {
      await deleteLead(deleteDialog.lead.id);
      setDeleteDialog({ open: false, lead: null });
    }
  };

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.qualificado).length,
    converted: leads.filter(l => l.status_negociacao === 'contrato_assinado').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status_negociacao === 'contrato_assinado').length / leads.length) * 100).toFixed(1) : '0'
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-elevated p-4 animate-pulse">
                <div className="h-8 bg-secondary rounded mb-2"></div>
                <div className="h-4 bg-secondary rounded"></div>
              </div>
            ))}
          </div>
        )}
        <div className="card-elevated p-6">
          <div className="h-64 bg-secondary rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-elevated p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-foreground-muted">Total de Leads</div>
          </div>
          <div className="card-elevated p-4 text-center">
            <div className="text-2xl font-bold text-warning-foreground">{stats.qualified}</div>
            <div className="text-sm text-foreground-muted">Qualificados</div>
          </div>
          <div className="card-elevated p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.converted}</div>
            <div className="text-sm text-foreground-muted">Convertidos</div>
          </div>
          <div className="card-elevated p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.conversionRate}%</div>
            <div className="text-sm text-foreground-muted">Taxa Conversão</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
          <Input
            placeholder="Buscar leads por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {filter === 'all' && 'Todos'}
              {filter === 'qualified' && 'Qualificados'}
              {filter === 'unqualified' && 'Não Qualificados'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter('all')}>
              Todos os Leads
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('qualified')}>
              Apenas Qualificados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('unqualified')}>
              Não Qualificados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Criado em</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr key={lead.id} className={index % 2 === 0 ? "bg-background" : "bg-background-secondary"}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-sm text-foreground-muted">{lead.email}</div>
                      </div>
                      {lead.qualificado && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{lead.phone}</div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(lead.status_negociacao)}
                  </td>
                  <td className="p-4 text-sm text-foreground">{lead.source || '-'}</td>
                  <td className="p-4 text-sm text-foreground-muted">
                    {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-8 h-8 p-0"
                        onClick={() => makePhoneCall(lead.id, lead.phone || '')}
                        disabled={!lead.phone}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-8 h-8 p-0"
                        onClick={() => setEmailDialog({ open: true, lead })}
                        disabled={!lead.email}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!lead.qualificado && (
                            <DropdownMenuItem onClick={() => qualifyLead(lead.id)}>
                              <Star className="w-4 h-4 mr-2" />
                              Qualificar Lead
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog({ open: true, lead })}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Excluir Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-8">
            <p className="text-foreground-muted">Nenhum lead encontrado</p>
            <p className="text-sm text-foreground-muted mt-1">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando novos leads ao sistema'}
            </p>
          </div>
        )}
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialog.open} onOpenChange={(open) => setEmailDialog({ open, lead: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar E-mail para {emailDialog.lead?.name}</DialogTitle>
            <DialogDescription>
              Enviar e-mail para: {emailDialog.lead?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assunto</label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Digite o assunto do e-mail"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Digite sua mensagem"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog({ open: false, lead: null })}>
              Cancelar
            </Button>
            <Button onClick={handleEmailSend}>
              Enviar E-mail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, lead: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Lead</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o lead "{deleteDialog.lead?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, lead: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}