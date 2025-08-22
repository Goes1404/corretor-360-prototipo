-- Add status_negociacao field to clients table
ALTER TABLE public.clients 
ADD COLUMN status_negociacao text DEFAULT 'novo_lead' CHECK (status_negociacao IN ('novo_lead', 'contato_realizado', 'visita_agendada', 'proposta_enviada', 'contrato_assinado'));

-- Create activities table
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  tipo_atividade text NOT NULL,
  descricao text NOT NULL,
  data_hora timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on activities table
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities table
CREATE POLICY "Corretores can manage their client activities" 
ON public.activities 
FOR ALL 
USING (
  client_id IN (
    SELECT c.id 
    FROM clients c 
    JOIN profiles p ON c.corretor_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Gestores can view all activities" 
ON public.activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'GESTOR'
  )
);

-- Create trigger for activities updated_at
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_activities_client_id ON public.activities(client_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_data_hora ON public.activities(data_hora DESC);
CREATE INDEX idx_clients_status_negociacao ON public.clients(status_negociacao);