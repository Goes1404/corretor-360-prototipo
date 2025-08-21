import { Users, TrendingUp, FileText, Target, Clock, DollarSign } from "lucide-react";
import { KPICard } from "@/components/Dashboard/KPICard";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { RecentActivities } from "@/components/Dashboard/RecentActivities";

const Dashboard = () => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-foreground-muted mt-1">Visão geral da sua performance comercial</p>
        </div>
        <div className="text-sm text-foreground-muted">
          Atualizado há 5 minutos
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Leads Ativos"
          value="247"
          change="+12% vs mês anterior"
          changeType="positive"
          icon={Users}
          description="15 novos esta semana"
        />
        <KPICard
          title="Propostas Enviadas"
          value="89"
          change="+8% vs mês anterior"
          changeType="positive"
          icon={FileText}
          description="23 aguardando retorno"
        />
        <KPICard
          title="Taxa de Conversão"
          value="24.5%"
          change="+2.1% vs mês anterior"
          changeType="positive"
          icon={Target}
          description="Meta: 25%"
        />
        <KPICard
          title="Vendas do Mês"
          value="R$ 485K"
          change="+15% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
          description="Meta: R$ 500K"
        />
        <KPICard
          title="Docs Pendentes"
          value="12"
          change="-3 vs semana passada"
          changeType="positive"
          icon={Clock}
          description="5 vencendo hoje"
        />
        <KPICard
          title="Score Performance"
          value="8.7/10"
          change="+0.3 vs mês anterior"
          changeType="positive"
          icon={TrendingUp}
          description="Excelente"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Funil de Vendas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border-l-4 border-primary">
              <div>
                <p className="font-medium text-foreground">Leads Qualificados</p>
                <p className="text-sm text-foreground-muted">156 contatos</p>
              </div>
              <span className="text-2xl font-bold text-primary">156</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border-l-4 border-warning">
              <div>
                <p className="font-medium text-foreground">Em Negociação</p>
                <p className="text-sm text-foreground-muted">89 propostas</p>
              </div>
              <span className="text-2xl font-bold text-warning-foreground">89</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border-l-4 border-success">
              <div>
                <p className="font-medium text-foreground">Fechados</p>
                <p className="text-sm text-foreground-muted">34 vendas</p>
              </div>
              <span className="text-2xl font-bold text-success">34</span>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Metas do Mês</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">Vendas</span>
                <span className="text-foreground-muted">R$ 485K / R$ 500K</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "97%" }}></div>
              </div>
              <p className="text-xs text-success mt-1">97% da meta atingida</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">Novos Leads</span>
                <span className="text-foreground-muted">247 / 300</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "82%" }}></div>
              </div>
              <p className="text-xs text-warning-foreground mt-1">82% da meta atingida</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">Conversões</span>
                <span className="text-foreground-muted">34 / 40</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
              <p className="text-xs text-warning-foreground mt-1">85% da meta atingida</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <RecentActivities />
    </div>
  );
};

export default Dashboard;