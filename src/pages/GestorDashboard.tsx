import { useState, useEffect } from "react";
import { BarChart3, Users, TrendingUp, DollarSign, Clock, Award, FileDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CorretorMetrics {
  id: string;
  full_name: string;
  conversion_rate: number;
  total_sales: number;
  avg_closing_time: number;
  most_sold_product: string;
  leads_count: number;
  conversions_count: number;
}

const GestorDashboard = () => {
  const [metrics, setMetrics] = useState<CorretorMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCorretor, setSelectedCorretor] = useState("all");
  const [selectedProductType, setSelectedProductType] = useState("all");
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos corretores com suas métricas
      const { data: corretores, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          sales:sales(value, status, closed_at, product_id),
          clients:clients(status),
          performance_metrics(*)
        `)
        .eq('role', 'CORRETOR');

      if (error) throw error;

      // Processar dados para calcular métricas
      const processedMetrics = corretores?.map(corretor => {
        const sales = corretor.sales || [];
        const clients = corretor.clients || [];
        const closedSales = sales.filter(sale => sale.status === 'FECHADA');
        
        const totalSales = closedSales.reduce((sum, sale) => sum + (sale.value || 0), 0);
        const leadsCount = clients.length;
        const conversionsCount = closedSales.length;
        const conversionRate = leadsCount > 0 ? (conversionsCount / leadsCount) * 100 : 0;
        
        // Calcular tempo médio de fechamento
        const avgClosingTime = closedSales.length > 0 
          ? closedSales.reduce((sum, sale) => {
              const createdAt = new Date(sale.closed_at || Date.now());
              const closedAt = new Date(sale.closed_at || Date.now());
              return sum + Math.abs(closedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / closedSales.length
          : 0;

        return {
          id: corretor.id,
          full_name: corretor.full_name,
          conversion_rate: conversionRate,
          total_sales: totalSales,
          avg_closing_time: Math.round(avgClosingTime),
          most_sold_product: 'APARTAMENTO', // Seria calculado com base nos produtos
          leads_count: leadsCount,
          conversions_count: conversionsCount,
        };
      }) || [];

      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Erro ao carregar métricas",
        description: "Não foi possível carregar os dados dos corretores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedPeriod, selectedCorretor, selectedProductType]);

  const totalSales = metrics.reduce((sum, m) => sum + m.total_sales, 0);
  const avgConversionRate = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.conversion_rate, 0) / metrics.length 
    : 0;
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions_count, 0);
  const avgClosingTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.avg_closing_time, 0) / metrics.length
    : 0;

  const getPerformanceStatus = (conversionRate: number) => {
    if (conversionRate >= 25) return { status: "Excelente", color: "success" };
    if (conversionRate >= 20) return { status: "Bom", color: "warning" };
    return { status: "Abaixo da média", color: "destructive" };
  };

  const exportReport = () => {
    // Implementar exportação para PDF/Excel
    toast({
      title: "Exportação iniciada",
      description: "O relatório será gerado em breve.",
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">Carregando métricas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel do Gestor</h1>
          <p className="text-foreground-muted mt-1">Visão completa da performance da equipe</p>
        </div>
        <Button onClick={exportReport} className="gap-2">
          <FileDown className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedCorretor} onValueChange={setSelectedCorretor}>
              <SelectTrigger>
                <SelectValue placeholder="Corretor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os corretores</SelectItem>
                {metrics.map((corretor) => (
                  <SelectItem key={corretor.id} value={corretor.id}>
                    {corretor.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedProductType} onValueChange={setSelectedProductType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                <SelectItem value="APARTAMENTO">Apartamentos</SelectItem>
                <SelectItem value="CASA">Casas</SelectItem>
                <SelectItem value="COMERCIAL">Comercial</SelectItem>
                <SelectItem value="SEGURO">Seguros</SelectItem>
                <SelectItem value="INVESTIMENTO">Investimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Total de Vendas</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalSales.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Taxa de Conversão Média</p>
              <p className="text-2xl font-bold text-foreground">
                {avgConversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Tempo Médio de Fechamento</p>
              <p className="text-2xl font-bold text-foreground">
                {avgClosingTime.toFixed(0)} dias
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Total de Conversões</p>
              <p className="text-2xl font-bold text-foreground">{totalConversions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance por Corretor */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance Individual</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-foreground-muted">Corretor</th>
                <th className="text-left p-3 text-sm font-medium text-foreground-muted">Taxa de Conversão</th>
                <th className="text-left p-3 text-sm font-medium text-foreground-muted">Total Vendido</th>
                <th className="text-left p-3 text-sm font-medium text-foreground-muted">Tempo Médio</th>
                <th className="text-left p-3 text-sm font-medium text-foreground-muted">Leads</th>
                <th className="text-left p-3 text-sm font-medium text-foreground-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((corretor) => {
                const performance = getPerformanceStatus(corretor.conversion_rate);
                return (
                  <tr key={corretor.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{corretor.full_name}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-foreground">{corretor.conversion_rate.toFixed(1)}%</div>
                    </td>
                    <td className="p-3">
                      <div className="text-foreground">
                        R$ {corretor.total_sales.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-foreground">{corretor.avg_closing_time} dias</div>
                    </td>
                    <td className="p-3">
                      <div className="text-foreground">
                        {corretor.leads_count} ({corretor.conversions_count} conv.)
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={performance.color === "success" ? "default" : 
                                performance.color === "warning" ? "secondary" : "destructive"}
                      >
                        {performance.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alertas de Performance */}
      {metrics.filter(m => m.conversion_rate < 20).length > 0 && (
        <Card className="p-6 border-l-4 border-l-destructive">
          <h3 className="text-lg font-semibold text-foreground mb-2">🚨 Alertas de Performance</h3>
          <p className="text-foreground-muted mb-3">
            Os seguintes corretores estão com performance abaixo da média:
          </p>
          <div className="space-y-2">
            {metrics
              .filter(m => m.conversion_rate < 20)
              .map(corretor => (
                <div key={corretor.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                  <span className="font-medium text-foreground">{corretor.full_name}</span>
                  <Badge variant="destructive">
                    {corretor.conversion_rate.toFixed(1)}% de conversão
                  </Badge>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default GestorDashboard;