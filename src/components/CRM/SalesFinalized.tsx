import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Eye, 
  Download, 
  X, 
  DollarSign, 
  Calendar, 
  FileText, 
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SaleFinalized {
  id: string;
  client_id: string;
  corretor_id: string;
  product_name: string;
  sale_value: number;
  completion_date: string;
  contract_url?: string;
  notes?: string;
  created_at: string;
  client_name?: string;
}

export function SalesFinalized() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  
  const [sales, setSales] = useState<SaleFinalized[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<SaleFinalized | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSalesFinalized();
  }, [profile?.id]);

  const fetchSalesFinalized = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sales_finalized')
        .select('*')
        .order('completion_date', { ascending: false });

      // Se não for gestor, filtrar apenas vendas do corretor
      if (profile?.role !== 'GESTOR') {
        query = query.eq('corretor_id', profile?.id);
      }

      const { data: salesData, error } = await query;
      if (error) throw error;

      // Buscar nomes dos clientes separadamente
      if (salesData && salesData.length > 0) {
        const clientIds = salesData.map(sale => sale.client_id);
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds);

        if (clientsError) throw clientsError;

        // Mapear dados combinando vendas com nomes dos clientes
        const processedSales = salesData.map(sale => ({
          ...sale,
          client_name: clientsData?.find(client => client.id === sale.client_id)?.name || 'Cliente não encontrado'
        }));

        setSales(processedSales);
      } else {
        setSales([]);
      }
    } catch (error) {
      console.error('Erro ao buscar vendas finalizadas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas finalizadas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSale = async (sale: SaleFinalized) => {
    if (!profile?.id) return;

    try {
      setCanceling(true);

      // Remover dados da venda
      const { error: deleteError } = await supabase
        .from('sales_finalized')
        .delete()
        .eq('id', sale.id);

      if (deleteError) throw deleteError;

      // Reverter status do lead para em_negociacao
      const { error: updateError } = await supabase
        .from('clients')
        .update({ status_negociacao: 'em_negociacao' })
        .eq('id', sale.client_id);

      if (updateError) throw updateError;

      // Remover contrato do storage se existir
      if (sale.contract_url) {
        try {
          const urlParts = sale.contract_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          await supabase.storage
            .from('contracts')
            .remove([`${profile.user_id}/${fileName}`]);
        } catch (storageError) {
          console.error('Erro ao remover contrato:', storageError);
        }
      }

      // Registrar atividade
      await logActivity(
        sale.client_id, 
        'venda_cancelada', 
        `Venda cancelada - Produto: ${sale.product_name}, Valor: R$ ${sale.sale_value.toLocaleString('pt-BR')}`
      );

      toast({
        title: "Venda cancelada",
        description: "A venda foi cancelada e o lead voltou para negociação"
      });

      // Atualizar lista
      setSales(prev => prev.filter(s => s.id !== sale.id));
      setCancelModal(null);
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a venda",
        variant: "destructive"
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleViewContract = (contractUrl: string) => {
    window.open(contractUrl, '_blank');
  };

  const handleDownloadContract = async (contractUrl: string, clientName: string) => {
    try {
      const response = await fetch(contractUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrato_${clientName}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: "O contrato está sendo baixado"
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o contrato",
        variant: "destructive"
      });
    }
  };

  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.sale_value, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Finalizadas</CardTitle>
            <CardDescription>Carregando vendas...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-secondary rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <TrendingUp className="w-8 h-8 text-success mr-3" />
            <div>
              <div className="text-2xl font-bold text-foreground">{sales.length}</div>
              <div className="text-sm text-foreground-muted">Vendas Realizadas</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <DollarSign className="w-8 h-8 text-success mr-3" />
            <div>
              <div className="text-2xl font-bold text-foreground">
                R$ {totalSalesValue.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-foreground-muted">Valor Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="w-8 h-8 text-primary mr-3" />
            <div>
              <div className="text-2xl font-bold text-foreground">
                {sales.length > 0 ? format(new Date(Math.max(...sales.map(s => new Date(s.completion_date).getTime()))), "MMM", { locale: ptBR }) : '-'}
              </div>
              <div className="text-sm text-foreground-muted">Último Mês</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Vendas Finalizadas
          </CardTitle>
          <CardDescription>
            Histórico de vendas concluídas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhuma venda finalizada</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                As vendas finalizadas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{sale.client_name}</h4>
                        <Badge className="bg-success text-white">Finalizada</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-foreground-muted">Imóvel:</p>
                          <p className="font-medium text-foreground">{sale.product_name}</p>
                        </div>
                        
                        <div>
                          <p className="text-foreground-muted">Valor da Venda:</p>
                          <p className="font-medium text-success">R$ {sale.sale_value.toLocaleString('pt-BR')}</p>
                        </div>
                        
                        <div>
                          <p className="text-foreground-muted">Data de Conclusão:</p>
                          <p className="font-medium text-foreground">
                            {format(new Date(sale.completion_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-foreground-muted">Registrada em:</p>
                          <p className="font-medium text-foreground">
                            {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      
                      {sale.notes && (
                        <div className="mt-2">
                          <p className="text-foreground-muted text-sm">Observações:</p>
                          <p className="text-sm text-foreground">{sale.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {sale.contract_url && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewContract(sale.contract_url!)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadContract(sale.contract_url!, sale.client_name || 'Cliente')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setCancelModal(sale)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Dialog open={!!cancelModal} onOpenChange={() => setCancelModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Cancelar Venda
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-foreground">
              Tem certeza que deseja cancelar esta venda? Os dados registrados serão removidos 
              e o lead voltará para a etapa de negociação.
            </p>
            
            {cancelModal && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{cancelModal.client_name}</p>
                <p className="text-sm text-foreground-muted">{cancelModal.product_name}</p>
                <p className="text-sm text-success">R$ {cancelModal.sale_value.toLocaleString('pt-BR')}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelModal(null)} disabled={canceling}>
              Manter Venda
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => cancelModal && handleCancelSale(cancelModal)}
              disabled={canceling}
            >
              {canceling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Cancelando...
                </div>
              ) : (
                'Confirmar Cancelamento'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}