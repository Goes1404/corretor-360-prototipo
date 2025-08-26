import { Users, TrendingUp, FileText, Target, Clock, DollarSign } from "lucide-react";
import { KPICard } from "@/components/Dashboard/KPICard";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { SalesFunnel } from "@/components/Dashboard/SalesFunnel";
import { RealTimeActivities } from "@/components/Dashboard/RealTimeActivities";
import { LeadsTable } from "@/components/CRM/LeadsTable";

const Dashboard = () => {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-foreground-muted mt-1 text-sm sm:text-base">Visão geral da sua performance comercial</p>
        </div>
        <div className="text-xs sm:text-sm text-foreground-muted">
          Atualizado há 5 minutos
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Funnel */}
        <SalesFunnel />

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
      <RealTimeActivities />

      {/* Recent Leads */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Leads Recentes</h3>
        <LeadsTable showStats={false} />
      </div>
    </div>
  );
};

export default Dashboard;