-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', false) 
ON CONFLICT (id) DO NOTHING;

-- Create sales table to store finalized sales data
CREATE TABLE IF NOT EXISTS public.sales_finalized (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  corretor_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  sale_value DECIMAL(15,2) NOT NULL,
  completion_date DATE NOT NULL,
  contract_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sales_finalized table
ALTER TABLE public.sales_finalized ENABLE ROW LEVEL SECURITY;

-- Create policies for sales_finalized table
CREATE POLICY "Corretores can manage their finalized sales" 
ON public.sales_finalized 
FOR ALL 
USING (corretor_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Gestores can view all finalized sales" 
ON public.sales_finalized 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'GESTOR'
));

-- Create storage policies for contracts
CREATE POLICY "Users can upload their own contracts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'contracts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own contracts" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'contracts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Gestores can view all contracts" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'contracts' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'GESTOR'
  )
);

-- Create trigger for updated_at on sales_finalized
CREATE TRIGGER update_sales_finalized_updated_at
  BEFORE UPDATE ON public.sales_finalized
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();