-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id),
    client_id UUID NOT NULL REFERENCES auth.users(id),
    professional_id UUID NOT NULL REFERENCES public.professionals(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_appointment_review UNIQUE (appointment_id)
);

-- Adicionar políticas RLS para a tabela de avaliações
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política para permitir que clientes criem avaliações
CREATE POLICY "Clientes podem criar avaliações" ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (client_id = auth.uid());

-- Política para permitir que clientes vejam suas próprias avaliações
CREATE POLICY "Clientes podem ver suas próprias avaliações" ON public.reviews
    FOR SELECT
    TO authenticated
    USING (client_id = auth.uid());

-- Política para permitir que todos vejam avaliações
CREATE POLICY "Todos podem ver avaliações" ON public.reviews
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Adicionar trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_reviews_professional_id ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON public.reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id ON public.reviews(appointment_id);
