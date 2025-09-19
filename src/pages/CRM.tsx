import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LeadsTable } from "@/components/CRM/LeadsTable";

const CRM = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">CRM Inteligente</h1>
          <p className="text-foreground-muted mt-1 text-sm sm:text-base">Gerencie seus leads e oportunidades</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-initial" onClick={() => navigate("/leads-qualificados")}>
            <Target className="w-4 h-4" />
            Leads Qualificados
          </Button>
          <Button className="gap-2 flex-1 sm:flex-initial" onClick={() => navigate("/novo-lead")}>
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Leads Table with Stats */}
      <LeadsTable showStats={true} />
    </div>
  );
};

export default CRM;