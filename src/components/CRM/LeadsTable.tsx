import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, 
  Mail, 
  MoreVertical, 
  Star, 
  Trash2, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Target,
  Calendar,
  UserX,
  RotateCcw
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DisqualifyModal } from "./DisqualifyModal";
import { AppointmentModal } from "@/components/Calendar/AppointmentModal";

interface LeadsTableProps {
  showStats?: boolean;
}

export function LeadsTable({ showStats = true }: LeadsTableProps) {
  const { 
    leads, 
    loading, 
    filter, 
    setFilter, 
    qualifyLead, 
    deleteLead, 
    disqualifyLead,
    requalifyLead,
    makePhoneCall, 
    sendEmail 
  } = useLeads();
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [disqualifyModal, setDisqualifyModal] = useState<{leadId: string, leadName: string} | null>(null);
  const [appointmentModal, setAppointmentModal] = useState<string | null>(null);

  const handleDeleteLead = (leadId: string) => {
    deleteLead(leadId);
    setDeleteConfirm(null);
  };

  const handleDisqualifyLead = (motivo: string, observacoes?: string) => {
    if (disqualifyModal) {
      disqualifyLead(disqualifyModal.leadId, motivo, observacoes);
      setDisqualifyModal(null);
    }
  };

  const handleRequalifyLead = (leadId: string) => {
    requalifyLead(leadId);
  };

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.qualificado && !l.desqualificado).length,
    disqualified: leads.filter(l => l.desqualificado).length,
    contacted: leads.filter(l => l.status_negociacao !== 'novo_lead').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo_lead': return 'bg-blue-500';
      case 'contato_realizado': return 'bg-yellow-500';
      case 'visita_agendada': return 'bg-purple-500';
      case 'proposta_enviada': return 'bg-orange-500';
      case 'contrato_assinado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'novo_lead': return 'Novo Lead';
      case 'contato_realizado': return 'Contato Realizado';
      case 'visita_agendada': return 'Visita Agendada';
      case 'proposta_enviada': return 'Proposta Enviada';
      case 'contrato_assinado': return 'Contrato Assinado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-8 bg-secondary rounded mb-2"></div>
                  <div className="h-4 bg-secondary rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-secondary rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="flex items-center p-3 sm:p-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs sm:text-sm text-foreground-muted truncate">Total de Leads</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-3 sm:p-4">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.qualified}</div>
                <div className="text-xs sm:text-sm text-foreground-muted truncate">Qualificados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-3 sm:p-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.contacted}</div>
                <div className="text-xs sm:text-sm text-foreground-muted truncate">Contatados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-3 sm:p-4">
              <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.disqualified}</div>
                <div className="text-xs sm:text-sm text-foreground-muted truncate">Desqualificados</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>Leads</span>
            <Select value={filter} onValueChange={(value: 'all' | 'qualified' | 'unqualified') => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="qualified">Qualificados</SelectItem>
                <SelectItem value="unqualified">Não Qualificados</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhum lead encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comece adicionando novos leads ao sistema.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto table-responsive scrollbar-thin">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground">Nome</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground">Telefone</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-foreground hidden lg:table-cell">Qualificação</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="font-medium text-foreground text-sm">{lead.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{lead.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-sm text-foreground-muted hidden sm:table-cell">{lead.email}</td>
                      <td className="py-3 px-2 sm:px-4 text-sm text-foreground-muted">{lead.phone}</td>
                      <td className="py-3 px-2 sm:px-4">
                        <Badge className={`${getStatusColor(lead.status_negociacao)} text-white text-xs`}>
                          {getStatusLabel(lead.status_negociacao)}
                        </Badge>
                        <div className="lg:hidden mt-1">
                          {lead.qualificado && !lead.desqualificado && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Qualificado
                            </Badge>
                          )}
                          {lead.desqualificado && (
                            <Badge className="bg-red-500 text-white text-xs">
                              Desqualificado
                            </Badge>
                          )}
                          {!lead.qualificado && !lead.desqualificado && (
                            <Badge variant="secondary" className="text-xs">Pendente</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
                        {lead.qualificado && !lead.desqualificado && (
                          <Badge className="bg-green-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Qualificado
                          </Badge>
                        )}
                        {lead.desqualificado && (
                          <Badge className="bg-red-500 text-white">
                            <UserX className="w-3 h-3 mr-1" />
                            Desqualificado
                          </Badge>
                        )}
                        {!lead.qualificado && !lead.desqualificado && (
                          <Badge variant="secondary">Pendente</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => makePhoneCall(lead.id, lead.phone || '')}
                            disabled={!lead.phone}
                            className="p-2"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => sendEmail(lead.id, lead.email || '', 'Contato', 'Olá!')}
                            disabled={!lead.email}
                            className="p-2 hidden sm:flex"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="p-2">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem 
                                onClick={() => sendEmail(lead.id, lead.email || '', 'Contato', 'Olá!')}
                                disabled={!lead.email}
                                className="sm:hidden"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar Email
                              </DropdownMenuItem>
                              
                              {!lead.qualificado && !lead.desqualificado && (
                                <DropdownMenuItem onClick={() => qualifyLead(lead.id)}>
                                  <Star className="w-4 h-4 mr-2" />
                                  Qualificar Lead
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem onClick={() => setAppointmentModal(lead.id)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Agendar Atendimento
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {lead.desqualificado ? (
                                <DropdownMenuItem onClick={() => handleRequalifyLead(lead.id)}>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Requalificar Lead
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => setDisqualifyModal({leadId: lead.id, leadName: lead.name})}
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Desqualificar Lead
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteConfirm(lead.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
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
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirmar Exclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteLead(deleteConfirm)}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <DisqualifyModal
        isOpen={!!disqualifyModal}
        onClose={() => setDisqualifyModal(null)}
        onConfirm={handleDisqualifyLead}
        leadName={disqualifyModal?.leadName || ''}
      />

      <AppointmentModal
        isOpen={!!appointmentModal}
        onClose={() => setAppointmentModal(null)}
        preSelectedClientId={appointmentModal || undefined}
      />
    </div>
  );
}