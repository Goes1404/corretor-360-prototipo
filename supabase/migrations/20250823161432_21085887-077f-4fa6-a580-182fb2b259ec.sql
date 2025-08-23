-- Adicionar campo qualificado à tabela clients
ALTER TABLE public.clients 
ADD COLUMN qualificado BOOLEAN DEFAULT FALSE;