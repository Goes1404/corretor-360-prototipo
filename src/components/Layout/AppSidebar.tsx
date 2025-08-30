import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Calculator, 
  FileText, 
  Lightbulb, 
  TrendingUp,
  Menu,
  X,
  Home,
  Calendar
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "CRM Inteligente", url: "/crm", icon: Users },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Simuladores", url: "/simuladores", icon: Calculator },
  { title: "Produtos", url: "/produtos", icon: FileText },
  { title: "Recomendações IA", url: "/recomendacoes", icon: Lightbulb },
  { title: "Análise de Mercado", url: "/analise-mercado", icon: TrendingUp },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full";
    return isActive(path)
      ? `${baseClasses} bg-primary text-primary-foreground shadow-sm`
      : `${baseClasses} text-foreground-muted hover:bg-secondary hover:text-foreground`;
  };

  return (
    <Sidebar
      className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} bg-card border-r border-border`}
      collapsible="icon"
    >
      <SidebarContent className="p-3 sm:p-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-primary">Corretor360</h1>
              <p className="text-xs text-foreground-muted">Sua central de vendas</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium text-sm sm:text-base">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        {!isCollapsed && (
          <div className="mt-auto pt-3 sm:pt-4 border-t border-border hidden sm:block">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-secondary">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm font-semibold text-primary-foreground">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">João Silva</p>
                <p className="text-xs text-foreground-muted truncate">Corretor Senior</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}