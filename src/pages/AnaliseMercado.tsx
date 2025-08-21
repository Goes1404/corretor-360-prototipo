import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Map, Calendar, Download } from "lucide-react";

const AnaliseMercado = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [selectedRegion, setSelectedRegion] = useState("sp");

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Análise de Mercado</h1>
          <p className="text-foreground-muted mt-1">Insights e tendências do mercado imobiliário e financeiro</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Último mês</SelectItem>
            <SelectItem value="3m">Últimos 3 meses</SelectItem>
            <SelectItem value="6m">Últimos 6 meses</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
            <SelectItem value="2y">Últimos 2 anos</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sp">São Paulo - SP</SelectItem>
            <SelectItem value="rj">Rio de Janeiro - RJ</SelectItem>
            <SelectItem value="mg">Belo Horizonte - MG</SelectItem>
            <SelectItem value="pr">Curitiba - PR</SelectItem>
            <SelectItem value="sc">Florianópolis - SC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-muted">Preço Médio m²</p>
              <p className="text-2xl font-bold text-foreground">R$ 8.450</p>
              <p className="text-sm text-success flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +5.2% vs mês anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-muted">Volume de Vendas</p>
              <p className="text-2xl font-bold text-foreground">2.847</p>
              <p className="text-sm text-destructive flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                -2.1% vs mês anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-muted">Taxa Selic</p>
              <p className="text-2xl font-bold text-foreground">10.75%</p>
              <p className="text-sm text-foreground-muted">Estável</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-foreground" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-muted">Financiamentos</p>
              <p className="text-2xl font-bold text-foreground">15.2K</p>
              <p className="text-sm text-success flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8.7% vs mês anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trend */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Evolução do Preço por m²</h3>
          <div className="h-64 bg-background-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-foreground-muted mx-auto mb-2" />
              <p className="text-foreground-muted">Gráfico de evolução dos preços</p>
              <p className="text-sm text-foreground-secondary">Últimos 6 meses</p>
            </div>
          </div>
        </div>

        {/* Market Distribution */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição por Tipo</h3>
          <div className="h-64 bg-background-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-foreground-muted mx-auto mb-2" />
              <p className="text-foreground-muted">Distribuição por tipo de imóvel</p>
              <p className="text-sm text-foreground-secondary">Apartamentos, Casas, Comercial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Bairros em Alta</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border-l-4 border-success">
              <div>
                <p className="font-medium text-foreground">Vila Madalena</p>
                <p className="text-sm text-foreground-muted">R$ 12.200/m²</p>
              </div>
              <span className="text-success font-bold">+12%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border-l-4 border-success">
              <div>
                <p className="font-medium text-foreground">Pinheiros</p>
                <p className="text-sm text-foreground-muted">R$ 11.800/m²</p>
              </div>
              <span className="text-success font-bold">+9.5%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border-l-4 border-success">
              <div>
                <p className="font-medium text-foreground">Brooklin</p>
                <p className="text-sm text-foreground-muted">R$ 10.900/m²</p>
              </div>
              <span className="text-success font-bold">+7.8%</span>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tendências Macro</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-medium text-foreground">Taxa de Juros</h4>
              <p className="text-sm text-foreground-muted">Expectativa de queda gradual nos próximos meses</p>
            </div>
            <div className="border-l-4 border-warning pl-4">
              <h4 className="font-medium text-foreground">Inflação</h4>
              <p className="text-sm text-foreground-muted">IPCA em trajetória de desaceleração</p>
            </div>
            <div className="border-l-4 border-success pl-4">
              <h4 className="font-medium text-foreground">Renda</h4>
              <p className="text-sm text-foreground-muted">Mercado de trabalho aquecido</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Oportunidades</h3>
          <div className="space-y-4">
            <div className="p-3 bg-primary/5 rounded-lg">
              <h4 className="font-medium text-primary">Primeira Casa</h4>
              <p className="text-sm text-foreground-muted">Programas governamentais com juros especiais</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <h4 className="font-medium text-warning-foreground">Refinanciamento</h4>
              <p className="text-sm text-foreground-muted">Momento ideal para renegociar contratos</p>
            </div>
            <div className="p-3 bg-success/5 rounded-lg">
              <h4 className="font-medium text-success">Investimentos</h4>
              <p className="text-sm text-foreground-muted">CDBs com rentabilidade atrativa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Analysis */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Map className="w-5 h-5" />
          Análise Regional - São Paulo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-background-muted rounded-lg">
            <h4 className="font-medium text-foreground">Zona Sul</h4>
            <p className="text-2xl font-bold text-primary">R$ 9.200</p>
            <p className="text-sm text-success">+4.2%</p>
          </div>
          <div className="text-center p-4 bg-background-muted rounded-lg">
            <h4 className="font-medium text-foreground">Zona Oeste</h4>
            <p className="text-2xl font-bold text-primary">R$ 7.800</p>
            <p className="text-sm text-success">+6.1%</p>
          </div>
          <div className="text-center p-4 bg-background-muted rounded-lg">
            <h4 className="font-medium text-foreground">Centro</h4>
            <p className="text-2xl font-bold text-primary">R$ 6.900</p>
            <p className="text-sm text-destructive">-1.5%</p>
          </div>
          <div className="text-center p-4 bg-background-muted rounded-lg">
            <h4 className="font-medium text-foreground">Zona Norte</h4>
            <p className="text-2xl font-bold text-primary">R$ 5.400</p>
            <p className="text-sm text-success">+2.8%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnaliseMercado;