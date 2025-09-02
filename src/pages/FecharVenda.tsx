import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Package, DollarSign, Calendar, FileText } from "lucide-react";

interface Product {
  id: string;
  title: string;
  type: string;
  location?: string;
  price?: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const FecharVenda = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    saleValue: "",
    completionDate: "",
    notes: ""
  });

  useEffect(() => {
    if (leadId) {
      fetchLeadAndProducts();
    }
  }, [leadId]);

  const fetchLeadAndProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch lead details
      const { data: leadData, error: leadError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadError) throw leadError;
      setLead(leadData);

      // Fetch available products
      let productsQuery = supabase
        .from("products")
        .select("id, title, type, location, price")
        .eq("status", "DISPONIVEL");

      // If user is not a manager, filter by their products
      if (profile?.role !== "GESTOR") {
        productsQuery = productsQuery.eq("corretor_id", profile?.id);
      }

      const { data: productsData, error: productsError } = await productsQuery;

      if (productsError) throw productsError;
      setProducts(productsData || []);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      productId,
      productName: product ? `${product.title} - ${product.type}` : "",
      saleValue: product?.price?.toString() || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.saleValue || !formData.completionDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      // Create finalized sale record
      const { error: saleError } = await supabase
        .from("sales_finalized")
        .insert({
          client_id: leadId,
          corretor_id: profile?.id,
          product_name: formData.productName,
          sale_value: parseFloat(formData.saleValue),
          completion_date: formData.completionDate,
          notes: formData.notes
        });

      if (saleError) throw saleError;

      // Update client status
      const { error: clientError } = await supabase
        .from("clients")
        .update({ 
          status: "VENDIDO",
          status_negociacao: "venda_finalizada"
        })
        .eq("id", leadId);

      if (clientError) throw clientError;

      // Log activity
      const { error: activityError } = await supabase
        .from("activities")
        .insert({
          user_id: profile?.id,
          client_id: leadId,
          tipo_atividade: "venda_finalizada",
          descricao: `Venda finalizada: ${formData.productName} - R$ ${formData.saleValue}`
        });

      if (activityError) throw activityError;

      toast({
        title: "Sucesso",
        description: "Venda finalizada com sucesso!",
        variant: "default"
      });

      navigate("/crm");
      
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a venda",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/crm")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-8">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/crm")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Fechar Venda</h1>
          <p className="text-foreground-muted">Cliente: {lead?.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Detalhes da Venda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produto *
              </Label>
              <Select onValueChange={handleProductSelect} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title} - {product.type}
                      {product.location && ` (${product.location})`}
                      {product.price && ` - R$ ${product.price.toLocaleString()}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sale Value */}
            <div className="space-y-2">
              <Label htmlFor="saleValue" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor da Venda (R$) *
              </Label>
              <Input
                id="saleValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.saleValue}
                onChange={(e) => setFormData(prev => ({ ...prev, saleValue: e.target.value }))}
                placeholder="0,00"
                required
              />
            </div>

            {/* Completion Date */}
            <div className="space-y-2">
              <Label htmlFor="completionDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Conclusão *
              </Label>
              <Input
                id="completionDate"
                type="date"
                value={formData.completionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Observações
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a venda..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Finalizando..." : "Finalizar Venda"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/crm")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FecharVenda;