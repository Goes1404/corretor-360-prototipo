import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  MessageCircle, 
  Calendar,
  ArrowRight,
  Filter,
  User,
  Clock,
  MapPin
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

type LeadPhase = 'interesse_inicial' | 'pre_qualificacao' | 'visita_agendada' | 'negociacao' | 'fechamento';

interface PhaseColumn {
  id: LeadPhase;
  title: string;
  color: string;
  icon: string;
  description: string;
}

const phases: PhaseColumn[] = [
  {
    id: 'interesse_inicial',
    title: 'Interesse Inicial',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    icon: '🟡',
    description: 'Lead demonstrou interesse inicial'
  },
  {
    id: 'pre_qualificacao',
    title: 'Pré-qualificação',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    icon: '🟠',
    description: 'Passou por triagem financeira'
  },
  {
    id: 'visita_agendada',
    title: 'Visita Agendada',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: '🔵',
    description: 'Visita marcada ou realizada'
  },
  {
    id: 'negociacao',
    title: 'Negociação',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    icon: '🟣',
    description: 'Negociando valores e condições'
  },
  {
    id: 'fechamento',
    title: 'Fechamento',
    color: 'bg-green-100 border-green-300 text-green-800',
    icon: '🟢',
    description: 'Documentação em andamento'
  }
];

import { Lead } from "@/hooks/useLeads";

interface LeadCardProps {
  lead: Lead;
  onPhoneCall: (leadId: string, phone: string) => void;
  onViewDetails: (leadId: string) => void;
}

function SortableLeadCard({ lead, onPhoneCall, onViewDetails }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">{lead.name}</h4>
            <Badge variant="secondary" className="text-xs">
              {lead.status}
            </Badge>
          </div>
          
          <div className="space-y-2 text-xs text-muted-foreground">
            {lead.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{lead.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          <div className="flex gap-1 mt-3">
            {lead.phone && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onPhoneCall(lead.id, lead.phone!);
                }}
              >
                <Phone className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(lead.id);
              }}
            >
              <User className="w-3 h-3 mr-1" />
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PhaseColumn({ phase, leads, onPhoneCall, onViewDetails }: {
  phase: PhaseColumn;
  leads: Lead[];
  onPhoneCall: (leadId: string, phone: string) => void;
  onViewDetails: (leadId: string) => void;
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{phase.icon}</span>
            <div>
              <CardTitle className="text-sm font-medium">
                {phase.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {phase.description}
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {leads.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 min-h-[400px]">
              {leads.map(lead => (
                <SortableLeadCard
                  key={lead.id}
                  lead={lead}
                  onPhoneCall={onPhoneCall}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

const LeadsQualificados = () => {
  const navigate = useNavigate();
  const { leads, loading, makePhoneCall, updateLeadPhase } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  // Filtrar apenas leads qualificados
  const qualifiedLeads = leads.filter(lead => lead.qualificado && !lead.desqualificado);

  // Mapear status_negociacao para fases
  const mapStatusToPhase = (status: string | null): LeadPhase => {
    switch (status) {
      case 'interesse_demonstrado':
        return 'interesse_inicial';
      case 'qualificado_financeiramente':
        return 'pre_qualificacao';
      case 'visita_realizada':
      case 'acompanhamento_pos_visita':
        return 'visita_agendada';
      case 'negociacao_em_andamento':
      case 'proposta_enviada':
        return 'negociacao';
      case 'documentacao_pendente':
      case 'contrato_assinado':
        return 'fechamento';
      default:
        return 'interesse_inicial';
    }
  };

  // Organizar leads por fase
  const leadsByPhase = phases.reduce((acc, phase) => {
    const phaseLeads = qualifiedLeads.filter(lead => 
      mapStatusToPhase(lead.status_negociacao) === phase.id &&
      (phaseFilter === 'all' || mapStatusToPhase(lead.status_negociacao) === phaseFilter)
    );
    acc[phase.id] = phaseLeads;
    return acc;
  }, {} as Record<LeadPhase, Lead[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const activeLeadId = active.id as string;
      const overContainerId = over.id as string;
      
      // Se foi solto em uma coluna
      if (phases.find(p => p.id === overContainerId)) {
        const newPhase = overContainerId as LeadPhase;
        const statusMap: Record<LeadPhase, string> = {
          interesse_inicial: 'interesse_demonstrado',
          pre_qualificacao: 'qualificado_financeiramente', 
          visita_agendada: 'visita_realizada',
          negociacao: 'negociacao_em_andamento',
          fechamento: 'documentacao_pendente'
        };
        
        updateLeadPhase?.(activeLeadId, statusMap[newPhase]);
      }
    }
    
    setActiveId(null);
  };

  const handlePhoneCall = (leadId: string, phone: string) => {
    makePhoneCall(leadId, phone);
  };

  const handleViewDetails = (leadId: string) => {
    navigate(`/detalhes-lead/${leadId}`);
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando leads qualificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Leads Qualificados</h1>
          <p className="text-foreground-muted mt-1">Pipeline de vendas - {qualifiedLeads.length} leads ativos</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fases</SelectItem>
              {phases.map(phase => (
                <SelectItem key={phase.id} value={phase.id}>
                  {phase.icon} {phase.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {phases.map(phase => (
            <PhaseColumn
              key={phase.id}
              phase={phase}
              leads={leadsByPhase[phase.id] || []}
              onPhoneCall={handlePhoneCall}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="opacity-75">
              {/* Card being dragged */}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {qualifiedLeads.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum lead qualificado encontrado
          </h3>
          <p className="text-muted-foreground">
            Qualifique seus leads no CRM para vê-los no pipeline de vendas.
          </p>
        </div>
      )}
    </div>
  );
};

export default LeadsQualificados;