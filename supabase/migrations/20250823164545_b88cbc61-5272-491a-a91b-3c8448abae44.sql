-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    corretor_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'Atendimento',
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'AGENDADO' CHECK (status IN ('AGENDADO', 'REALIZADO', 'CANCELADO')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para appointments
CREATE POLICY "Corretores can manage their appointments" 
ON public.appointments 
FOR ALL 
USING (corretor_id IN (
    SELECT profiles.id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Gestores can view all appointments" 
ON public.appointments 
FOR SELECT 
USING (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'GESTOR'
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar tabela clients para adicionar status de desqualificação
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS desqualificado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS motivo_desqualificacao TEXT,
ADD COLUMN IF NOT EXISTS observacoes_desqualificacao TEXT;