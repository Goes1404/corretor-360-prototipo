import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { Upload, CheckCircle2 } from "lucide-react";

interface FinalizeSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  onSuccess?: () => void;
}

interface Product {
  id: string;
  title: string;
  type: string;
  location?: string;
}

export function FinalizeSaleModal({ isOpen, onClose, leadId, leadName, onSuccess }: FinalizeSaleModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    productName: '',
    saleValue: '',
    completionDate: '',
    contractFile: null as File | null,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, profile?.id]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('id, title, type, location')
        .eq('status', 'DISPONIVEL');

      // Se não for gestor, filtrar apenas produtos do corretor
      if (profile?.role !== 'GESTOR') {
        query = query.eq('corretor_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileName = `${profile?.user_id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do contrato",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.saleValue || !formData.completionDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Upload do contrato se fornecido
      let contractUrl = null;
      if (formData.contractFile) {
        contractUrl = await handleFileUpload(formData.contractFile);
        if (!contractUrl) return; // Se falhou o upload, para aqui
      }

      // Salvar dados da venda
      const { error: salesError } = await supabase
        .from('sales_finalized')
        .insert({
          client_id: leadId,
          corretor_id: profile.id,
          product_name: formData.productName,
          sale_value: parseFloat(formData.saleValue),
          completion_date: formData.completionDate,
          contract_url: contractUrl,
          notes: formData.notes || null
        });

      if (salesError) throw salesError;

      // Atualizar status do lead
      const { error: updateError } = await supabase
        .from('clients')
        .update({ status_negociacao: 'venda_concluida' })
        .eq('id', leadId);

      if (updateError) throw updateError;

      // Registrar atividade
      await logActivity(
        leadId, 
        'venda_finalizada', 
        `Venda finalizada - Produto: ${formData.productName}, Valor: R$ ${formData.saleValue}`
      );

      toast({
        title: "Venda finalizada!",
        description: "A venda foi registrada com sucesso",
      });

      // Reset form
      setFormData({
        productName: '',
        saleValue: '',
        completionDate: '',
        contractFile: null,
        notes: ''
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a venda",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Finalizar Venda - {leadName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productName">Nome do Imóvel *</Label>
            <Select value={formData.productName} onValueChange={(value) => handleInputChange('productName', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.title}>
                    {product.title} - {product.type} {product.location && `(${product.location})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="saleValue">Valor Final da Venda *</Label>
            <Input
              id="saleValue"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 450000.00"
              value={formData.saleValue}
              onChange={(e) => handleInputChange('saleValue', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="completionDate">Data da Conclusão *</Label>
            <Input
              id="completionDate"
              type="date"
              value={formData.completionDate}
              onChange={(e) => handleInputChange('completionDate', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="contractFile">Contrato (PDF ou Imagem)</Label>
            <div className="mt-1">
              <Input
                id="contractFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleInputChange('contractFile', e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações Adicionais</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre a venda..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading || uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  {uploading ? 'Enviando...' : 'Finalizando...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Confirmar Venda
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}