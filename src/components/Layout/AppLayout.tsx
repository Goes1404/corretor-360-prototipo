import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout",
        variant: "destructive"
      });
    }
  };
  return (
  <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background-secondary">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              <SidebarTrigger />
              <div className="relative flex-1 max-w-sm lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-3">
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">3</span>
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sair</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}