import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LeadsTable } from "@/components/CRM/LeadsTable";

const CRM = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Inteligente</h1>
          <p className="text-foreground-muted mt-1">Gerencie seus leads e oportunidades</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/novo-lead")}>
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      {/* Leads Table with Stats */}
      <LeadsTable showStats={true} />
    </div>
  );
};

export default CRM;