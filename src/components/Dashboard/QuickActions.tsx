import { Button } from "@/components/ui/button";
import { Plus, Upload, Phone, Mail } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      label: "Novo Lead",
      icon: Plus,
      variant: "default" as const,
      description: "Cadastrar prospect"
    },
    {
      label: "Upload Docs",
      icon: Upload,
      variant: "outline" as const,
      description: "Enviar documentos"
    },
    {
      label: "Fazer Ligação",
      icon: Phone,
      variant: "outline" as const,
      description: "Contato direto"
    },
    {
      label: "Enviar E-mail",
      icon: Mail,
      variant: "outline" as const,
      description: "Marketing direto"
    },
  ];

  return (
    <div className="card-elevated p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="flex-col h-auto py-4 gap-2"
          >
            <action.icon className="w-5 h-5" />
            <div className="text-center">
              <div className="text-sm font-medium">{action.label}</div>
              <div className="text-xs opacity-70">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}