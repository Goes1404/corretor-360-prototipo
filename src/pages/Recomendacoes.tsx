import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Send, TrendingUp, Shield, Home, Star, Brain, Target } from "lucide-react";

interface Recommendation {
  id: string;
  client: string;
  product: string;
  type: "investimento" | "seguro" | "financiamento";
  confidence: number;
  reason: string;
  expectedReturn?: string;
  risk: "baixo" | "medio" | "alto";
  priority: "alta" | "media" | "baixa";
}

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    client: "Maria Silva",
    product: "CDB Prefixado 12% a.a.",
    type: "investimento",
    confidence: 94,
    reason: "Perfil conservador + reserva de emergência constituída + prazo de 2 anos",
    expectedReturn: "R$ 4.800 em 24 meses",
    risk: "baixo",
    priority: "alta"
  },
  {
    id: "2",
    client: "João Santos",
    product: "Seguro Residencial Premium",
    type: "seguro",
    confidence: 88,
    reason: "Imóvel recém-adquirido + região de risco + valor alto do bem",
    risk: "baixo",
    priority: "alta"
  },
  {
    id: "3",
    client: "Ana Costa",
    product: "Financiamento Casa Verde e Amarela",
    type: "financiamento",
    confidence: 76,
    reason: "Primeira casa + renda compatível + benefícios do programa",
    risk: "medio",
    priority: "media"
  },
  {
    id: "4",
    client: "Carlos Oliveira",
    product: "Fundo Multimercado",
    type: "investimento",
    confidence: 82,
    reason: "Perfil moderado + diversificação + horizonte de 5 anos",
    expectedReturn: "R$ 15.200 em 60 meses",
    risk: "medio",
    priority: "alta"
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "investimento":
      return TrendingUp;
    case "seguro":
      return Shield;
    case "financiamento":
      return Home;
    default:
      return Lightbulb;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "investimento":
      return "bg-success/10 text-success border-success/20";
    case "seguro":
      return "bg-primary/10 text-primary border-primary/20";
    case "financiamento":
      return "bg-warning/10 text-warning-foreground border-warning/20";
    default:
      return "bg-secondary";
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "baixo":
      return "text-success";
    case "medio":
      return "text-warning-foreground";
    case "alto":
      return "text-destructive";
    default:
      return "text-foreground-muted";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "alta":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "media":
      return "bg-warning/10 text-warning-foreground border-warning/20";
    case "baixa":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-secondary";
  }
};

const Recomendacoes = () => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Recomendações Inteligentes
          </h1>
          <p className="text-foreground-muted mt-1">IA analisa o perfil dos clientes e sugere os melhores produtos</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-6 text-center">
          <Target className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">94%</div>
          <div className="text-sm text-foreground-muted">Taxa de Aceitação</div>
        </div>
        <div className="card-elevated p-6 text-center">
          <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-success">+37%</div>
          <div className="text-sm text-foreground-muted">Aumento nas Vendas</div>
        </div>
        <div className="card-elevated p-6 text-center">
          <Lightbulb className="w-8 h-8 text-warning-foreground mx-auto mb-2" />
          <div className="text-2xl font-bold text-warning-foreground">156</div>
          <div className="text-sm text-foreground-muted">Recomendações Ativas</div>
        </div>
      </div>

      {/* How it Works */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Como Funciona a IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold">1</span>
            </div>
            <h4 className="font-medium text-foreground">Análise de Perfil</h4>
            <p className="text-sm text-foreground-muted">Idade, renda, histórico e objetivos</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold">2</span>
            </div>
            <h4 className="font-medium text-foreground">Comportamento</h4>
            <p className="text-sm text-foreground-muted">Padrões de compra e preferências</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold">3</span>
            </div>
            <h4 className="font-medium text-foreground">Machine Learning</h4>
            <p className="text-sm text-foreground-muted">Algoritmo identifica oportunidades</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold">4</span>
            </div>
            <h4 className="font-medium text-foreground">Sugestão</h4>
            <p className="text-sm text-foreground-muted">Produto ideal com justificativa</p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recomendações Personalizadas</h3>
        
        {mockRecommendations.map((rec) => {
          const Icon = getTypeIcon(rec.type);
          return (
            <div key={rec.id} className="card-interactive p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(rec.type)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-foreground">{rec.client}</h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        Prioridade {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-foreground font-medium">{rec.product}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-foreground-muted">
                      <span>Confiança: <span className="font-medium text-primary">{rec.confidence}%</span></span>
                      <span>Risco: <span className={`font-medium ${getRiskColor(rec.risk)}`}>{rec.risk}</span></span>
                      {rec.expectedReturn && (
                        <span>Retorno: <span className="font-medium text-success">{rec.expectedReturn}</span></span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rec.confidence / 20)
                            ? "text-warning fill-warning"
                            : "text-foreground-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-background-muted p-4 rounded-lg mb-4">
                <h5 className="font-medium text-foreground mb-2">Justificativa da IA:</h5>
                <p className="text-sm text-foreground-muted">{rec.reason}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-foreground-muted">
                  Recomendação gerada há 2 horas
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Send className="w-4 h-4" />
                    Enviar para Cliente
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance das Recomendações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Por Tipo de Produto</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Investimentos</span>
                <span className="font-medium">89% aceitas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Seguros</span>
                <span className="font-medium">76% aceitas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Financiamentos</span>
                <span className="font-medium">92% aceitas</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-3">Impacto no Faturamento</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Este mês</span>
                <span className="font-medium text-success">+R$ 127.400</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Último trimestre</span>
                <span className="font-medium text-success">+R$ 358.900</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Total anual</span>
                <span className="font-medium text-success">+R$ 1.2M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recomendacoes;