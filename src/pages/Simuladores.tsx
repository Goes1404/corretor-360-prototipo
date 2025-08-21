import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Home, Shield, TrendingUp, Download } from "lucide-react";

const Simuladores = () => {
  const [activeTab, setActiveTab] = useState("financiamento");

  const simulatorTabs = [
    { id: "financiamento", label: "Financiamento Imobiliário", icon: Home },
    { id: "seguros", label: "Seguros", icon: Shield },
    { id: "investimentos", label: "Investimentos", icon: TrendingUp },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Simuladores</h1>
          <p className="text-foreground-muted mt-1">Calcule e projete os melhores cenários para seus clientes</p>
        </div>
      </div>

      {/* Simulator Tabs */}
      <div className="flex flex-wrap gap-2">
        {simulatorTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Simulator Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {activeTab === "financiamento" && "Dados do Financiamento"}
            {activeTab === "seguros" && "Dados do Seguro"}
            {activeTab === "investimentos" && "Dados do Investimento"}
          </h3>

          <div className="space-y-4">
            {activeTab === "financiamento" && (
              <>
                <div>
                  <Label htmlFor="valor-imovel">Valor do Imóvel</Label>
                  <Input id="valor-imovel" placeholder="R$ 350.000,00" />
                </div>
                <div>
                  <Label htmlFor="entrada">Valor da Entrada</Label>
                  <Input id="entrada" placeholder="R$ 70.000,00" />
                </div>
                <div>
                  <Label htmlFor="prazo">Prazo (anos)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 anos</SelectItem>
                      <SelectItem value="15">15 anos</SelectItem>
                      <SelectItem value="20">20 anos</SelectItem>
                      <SelectItem value="25">25 anos</SelectItem>
                      <SelectItem value="30">30 anos</SelectItem>
                      <SelectItem value="35">35 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxa">Taxa de Juros (% a.a.)</Label>
                  <Input id="taxa" placeholder="10,5%" />
                </div>
                <div>
                  <Label htmlFor="renda">Renda Familiar</Label>
                  <Input id="renda" placeholder="R$ 8.000,00" />
                </div>
              </>
            )}

            {activeTab === "seguros" && (
              <>
                <div>
                  <Label htmlFor="tipo-seguro">Tipo de Seguro</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Seguro Auto</SelectItem>
                      <SelectItem value="residencial">Seguro Residencial</SelectItem>
                      <SelectItem value="vida">Seguro de Vida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idade">Idade do Segurado</Label>
                  <Input id="idade" placeholder="35 anos" />
                </div>
                <div>
                  <Label htmlFor="valor-bem">Valor do Bem</Label>
                  <Input id="valor-bem" placeholder="R$ 45.000,00" />
                </div>
                <div>
                  <Label htmlFor="cobertura">Cobertura Desejada</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cobertura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basica">Básica</SelectItem>
                      <SelectItem value="intermediaria">Intermediária</SelectItem>
                      <SelectItem value="completa">Completa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === "investimentos" && (
              <>
                <div>
                  <Label htmlFor="valor-inicial">Valor Inicial</Label>
                  <Input id="valor-inicial" placeholder="R$ 10.000,00" />
                </div>
                <div>
                  <Label htmlFor="aporte-mensal">Aporte Mensal</Label>
                  <Input id="aporte-mensal" placeholder="R$ 500,00" />
                </div>
                <div>
                  <Label htmlFor="prazo-investimento">Prazo (anos)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 ano</SelectItem>
                      <SelectItem value="2">2 anos</SelectItem>
                      <SelectItem value="5">5 anos</SelectItem>
                      <SelectItem value="10">10 anos</SelectItem>
                      <SelectItem value="15">15 anos</SelectItem>
                      <SelectItem value="20">20 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo-investimento">Tipo de Investimento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdb">CDB</SelectItem>
                      <SelectItem value="lci">LCI</SelectItem>
                      <SelectItem value="tesouro">Tesouro Direto</SelectItem>
                      <SelectItem value="fundos">Fundos de Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button className="w-full gap-2">
              <Calculator className="w-4 h-4" />
              Simular
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resultados da Simulação</h3>
          
          {activeTab === "financiamento" && (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                <h4 className="font-medium text-foreground">Prestação Mensal</h4>
                <p className="text-2xl font-bold text-primary">R$ 2.847,32</p>
                <p className="text-sm text-foreground-muted">SAC - Parcela inicial</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Valor Financiado</p>
                  <p className="font-semibold text-foreground">R$ 280.000,00</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Total de Juros</p>
                  <p className="font-semibold text-foreground">R$ 198.452,80</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Valor Total</p>
                  <p className="font-semibold text-foreground">R$ 478.452,80</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">CET</p>
                  <p className="font-semibold text-foreground">11,24% a.a.</p>
                </div>
              </div>

              <div className="bg-success/5 p-4 rounded-lg border-l-4 border-success">
                <p className="text-sm text-success font-medium">✓ Aprovação viável</p>
                <p className="text-xs text-foreground-muted">Comprometimento de 35,6% da renda</p>
              </div>
            </div>
          )}

          {activeTab === "seguros" && (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                <h4 className="font-medium text-foreground">Prêmio Mensal</h4>
                <p className="text-2xl font-bold text-primary">R$ 187,50</p>
                <p className="text-sm text-foreground-muted">Cobertura completa</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Cobertura para Danos</p>
                  <p className="font-semibold text-foreground">R$ 45.000,00</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Cobertura para Terceiros</p>
                  <p className="font-semibold text-foreground">R$ 100.000,00</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Franquia</p>
                  <p className="font-semibold text-foreground">R$ 2.250,00</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "investimentos" && (
            <div className="space-y-4">
              <div className="bg-success/5 p-4 rounded-lg border-l-4 border-success">
                <h4 className="font-medium text-foreground">Valor Final Estimado</h4>
                <p className="text-2xl font-bold text-success">R$ 187.346,85</p>
                <p className="text-sm text-foreground-muted">Em 10 anos</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Total Investido</p>
                  <p className="font-semibold text-foreground">R$ 70.000,00</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Rendimento</p>
                  <p className="font-semibold text-success">R$ 117.346,85</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Rentabilidade</p>
                  <p className="font-semibold text-foreground">167,6%</p>
                </div>
                <div className="bg-background-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground-muted">Taxa Mensal</p>
                  <p className="font-semibold text-foreground">0,85%</p>
                </div>
              </div>
            </div>
          )}

          <Button className="w-full gap-2 mt-4" variant="outline">
            <Download className="w-4 h-4" />
            Gerar PDF da Simulação
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Simuladores;