import { Clock, User, FileText, Phone, CheckCircle } from "lucide-react";

interface Activity {
  id: string;
  type: "lead" | "document" | "call" | "proposal";
  title: string;
  description: string;
  time: string;
  status?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "lead",
    title: "Novo lead cadastrado",
    description: "Maria Silva - Apartamento 2 quartos",
    time: "há 15 min",
    status: "quente"
  },
  {
    id: "2",
    type: "call",
    title: "Ligação realizada",
    description: "João Santos - Seguimento proposta seguro",
    time: "há 1h",
  },
  {
    id: "3",
    type: "document",
    title: "Documentos recebidos",
    description: "Ana Costa - CPF e RG para financiamento",
    time: "há 2h",
    status: "completo"
  },
  {
    id: "4",
    type: "proposal",
    title: "Proposta enviada",
    description: "Carlos Oliveira - Simulação investimento CDB",
    time: "há 3h",
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "lead":
      return User;
    case "document":
      return FileText;
    case "call":
      return Phone;
    case "proposal":
      return CheckCircle;
    default:
      return Clock;
  }
};

const getStatusBadge = (status?: string) => {
  if (!status) return null;
  
  switch (status) {
    case "quente":
      return <span className="status-warning">Quente</span>;
    case "completo":
      return <span className="status-success">Completo</span>;
    case "pendente":
      return <span className="status-pending">Pendente</span>;
    default:
      return null;
  }
};

export function RecentActivities() {
  return (
    <div className="card-elevated p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Atividades Recentes</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-background-muted transition-colors">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-foreground-muted">{activity.time}</span>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted">{activity.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}