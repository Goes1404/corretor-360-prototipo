import { SalesFinalized } from "@/components/CRM/SalesFinalized";

const VendasFinalizadas = () => {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Vendas Finalizadas</h1>
          <p className="text-foreground-muted mt-1 text-sm sm:text-base">Histórico de vendas concluídas</p>
        </div>
      </div>

      {/* Sales Component */}
      <SalesFinalized />
    </div>
  );
};

export default VendasFinalizadas;