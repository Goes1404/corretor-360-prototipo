import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
}

export function KPICard({ title, value, change, changeType = "neutral", icon: Icon, description }: KPICardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-foreground-muted";
    }
  };

  return (
    <div className="card-interactive p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground-muted truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm mt-1 ${getChangeColor()} truncate`}>
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-foreground-muted mt-1 sm:mt-2 truncate">{description}</p>
          )}
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}