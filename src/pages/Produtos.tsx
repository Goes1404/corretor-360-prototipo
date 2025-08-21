import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, MapPin, Bed, Bath, Square, Upload, Play, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  description?: string;
  type: string;
  price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO';
  images?: string[];
  videos?: string[];
  created_at: string;
}

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    type: "APARTAMENTO",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    status: "DISPONIVEL" as 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Se for corretor, mostrar apenas seus produtos
      if (profile?.role === 'CORRETOR') {
        query = query.eq('corretor_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data as Product[] || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [profile]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || product.type === filterType;
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    
    let matchesPrice = true;
    if (priceRange.min && product.price) {
      matchesPrice = matchesPrice && product.price >= parseFloat(priceRange.min);
    }
    if (priceRange.max && product.price) {
      matchesPrice = matchesPrice && product.price <= parseFloat(priceRange.max);
    }

    return matchesSearch && matchesType && matchesStatus && matchesPrice;
  });

  const resetForm = () => {
    setProductForm({
      title: "",
      description: "",
      type: "APARTAMENTO",
      price: "",
      location: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      status: "DISPONIVEL" as 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO',
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const productData = {
        title: productForm.title,
        description: productForm.description || null,
        type: productForm.type,
        price: productForm.price ? parseFloat(productForm.price) : null,
        location: productForm.location || null,
        bedrooms: productForm.bedrooms ? parseInt(productForm.bedrooms) : null,
        bathrooms: productForm.bathrooms ? parseInt(productForm.bathrooms) : null,
        area: productForm.area ? parseFloat(productForm.area) : null,
        status: productForm.status,
        corretor_id: profile.id,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "Produto atualizado",
          description: "As informações do produto foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        
        toast({
          title: "Produto cadastrado",
          description: "Novo produto adicionado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar produto",
        description: "Não foi possível salvar as informações do produto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setProductForm({
      title: product.title,
      description: product.description || "",
      type: product.type,
      price: product.price?.toString() || "",
      location: product.location || "",
      bedrooms: product.bedrooms?.toString() || "",
      bathrooms: product.bathrooms?.toString() || "",
      area: product.area?.toString() || "",
      status: product.status as 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO',
    });
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso.",
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'bg-success/10 text-success border-success/20';
      case 'RESERVADO': return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'VENDIDO': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'Disponível';
      case 'RESERVADO': return 'Reservado';
      case 'VENDIDO': return 'Vendido';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground-muted">Carregando produtos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-foreground-muted mt-1">Gerencie seus imóveis, seguros e investimentos</p>
        </div>
        {profile?.role === 'CORRETOR' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={productForm.type} onValueChange={(value) => setProductForm({...productForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                        <SelectItem value="CASA">Casa</SelectItem>
                        <SelectItem value="COMERCIAL">Comercial</SelectItem>
                        <SelectItem value="TERRENO">Terreno</SelectItem>
                        <SelectItem value="SEGURO">Seguro</SelectItem>
                        <SelectItem value="INVESTIMENTO">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={productForm.location}
                      onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                    />
                  </div>
                </div>

                {(productForm.type === 'APARTAMENTO' || productForm.type === 'CASA') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Quartos</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={productForm.bedrooms}
                        onChange={(e) => setProductForm({...productForm, bedrooms: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Banheiros</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={productForm.bathrooms}
                        onChange={(e) => setProductForm({...productForm, bathrooms: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Área (m²)</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.01"
                        value={productForm.area}
                        onChange={(e) => setProductForm({...productForm, area: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={productForm.status} onValueChange={(value: any) => setProductForm({...productForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                      <SelectItem value="RESERVADO">Reservado</SelectItem>
                      <SelectItem value="VENDIDO">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="APARTAMENTO">Apartamentos</SelectItem>
              <SelectItem value="CASA">Casas</SelectItem>
              <SelectItem value="COMERCIAL">Comercial</SelectItem>
              <SelectItem value="TERRENO">Terrenos</SelectItem>
              <SelectItem value="SEGURO">Seguros</SelectItem>
              <SelectItem value="INVESTIMENTO">Investimentos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="DISPONIVEL">Disponível</SelectItem>
              <SelectItem value="RESERVADO">Reservado</SelectItem>
              <SelectItem value="VENDIDO">Vendido</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Preço mín."
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
          />

          <Input
            placeholder="Preço máx."
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
          />
        </div>
      </Card>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover-lift">
            {/* Área de imagem/vídeo placeholder */}
            <div className="h-48 bg-secondary relative flex items-center justify-center">
              <div className="text-center text-foreground-muted">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Adicionar imagens</p>
              </div>
              <Badge className={`absolute top-3 right-3 ${getStatusColor(product.status)}`}>
                {getStatusText(product.status)}
              </Badge>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                  {product.title}
                </h3>
                {profile?.role === 'CORRETOR' && (
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(product)}
                      className="w-8 h-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(product.id)}
                      className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Badge variant="outline" className="mb-2">
                {product.type}
              </Badge>

              {product.price && (
                <p className="text-2xl font-bold text-primary mb-2">
                  R$ {product.price.toLocaleString('pt-BR')}
                </p>
              )}

              {product.location && (
                <div className="flex items-center gap-1 text-sm text-foreground-muted mb-2">
                  <MapPin className="w-4 h-4" />
                  {product.location}
                </div>
              )}

              {(product.bedrooms || product.bathrooms || product.area) && (
                <div className="flex items-center gap-4 text-sm text-foreground-muted mb-3">
                  {product.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {product.bedrooms}
                    </div>
                  )}
                  {product.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {product.bathrooms}
                    </div>
                  )}
                  {product.area && (
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      {product.area}m²
                    </div>
                  )}
                </div>
              )}

              {product.description && (
                <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
                  {product.description}
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalhes
                </Button>
                {profile?.role === 'CORRETOR' && (
                  <Button size="sm" className="flex-1">
                    Compartilhar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-foreground-muted">
            {products.length === 0 
              ? 'Nenhum produto cadastrado ainda.' 
              : 'Nenhum produto encontrado com os filtros aplicados.'
            }
          </p>
          {products.length === 0 && profile?.role === 'CORRETOR' && (
            <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
              Cadastrar Primeiro Produto
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default Produtos;