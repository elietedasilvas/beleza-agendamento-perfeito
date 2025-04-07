-- Verificar se a tabela já existe e se o campo status existe
DO $$
BEGIN
    -- Criar a tabela se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reviews') THEN
        CREATE TABLE public.reviews (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            appointment_id UUID NOT NULL REFERENCES public.appointments(id),
            client_id UUID NOT NULL REFERENCES auth.users(id),
            professional_id UUID NOT NULL REFERENCES public.professionals(id),
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE,
            CONSTRAINT unique_appointment_review UNIQUE (appointment_id)
        );
    ELSE
        -- Verificar se o campo status existe e adicioná-lo se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'status') THEN
            ALTER TABLE public.reviews ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
        END IF;
    END IF;
END
$$;

-- Adicionar políticas RLS para a tabela de avaliações
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política para permitir que clientes criem avaliações
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'reviews'
        AND policyname = 'Clientes podem criar avaliações'
    ) THEN
        EXECUTE 'CREATE POLICY "Clientes podem criar avaliações" ON public.reviews
            FOR INSERT
            TO authenticated
            WITH CHECK (client_id = auth.uid())';
    END IF;
END
$$;

-- Política para permitir que clientes vejam suas próprias avaliações
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'reviews'
        AND policyname = 'Clientes podem ver suas próprias avaliações'
    ) THEN
        EXECUTE 'CREATE POLICY "Clientes podem ver suas próprias avaliações" ON public.reviews
            FOR SELECT
            TO authenticated
            USING (client_id = auth.uid())';
    END IF;
END
$$;

-- Política para permitir que todos vejam avaliações aprovadas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'reviews'
        AND policyname = 'Todos podem ver avaliações aprovadas'
    ) THEN
        EXECUTE 'CREATE POLICY "Todos podem ver avaliações aprovadas" ON public.reviews
            FOR SELECT
            TO anon, authenticated
            USING (status = ''approved'')';
    END IF;
END
$$;

-- Política para permitir que administradores vejam todas as avaliações
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'reviews'
        AND policyname = 'Admins podem gerenciar avaliações'
    ) THEN
        EXECUTE 'CREATE POLICY "Admins podem gerenciar avaliações" ON public.reviews
            FOR ALL
            TO authenticated
            USING (EXISTS (
                SELECT 1 FROM auth.users
                JOIN public.profiles ON auth.users.id = public.profiles.id
                WHERE auth.users.id = auth.uid() AND public.profiles.role = ''admin''
            ))';
    END IF;
END
$$;

-- Adicionar trigger para atualizar o campo updated_at
DO $$
BEGIN
    -- Criar a função se não existir ou atualizá-la
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Criar o trigger se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_reviews_updated_at'
    ) THEN
        CREATE TRIGGER update_reviews_updated_at
        BEFORE UPDATE ON public.reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Adicionar índices para melhorar a performance
DO $$
BEGIN
    -- Criar índice para professional_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_reviews_professional_id'
    ) THEN
        CREATE INDEX idx_reviews_professional_id ON public.reviews(professional_id);
    END IF;

    -- Criar índice para client_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_reviews_client_id'
    ) THEN
        CREATE INDEX idx_reviews_client_id ON public.reviews(client_id);
    END IF;

    -- Criar índice para appointment_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_reviews_appointment_id'
    ) THEN
        CREATE INDEX idx_reviews_appointment_id ON public.reviews(appointment_id);
    END IF;

    -- Criar índice para status se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_reviews_status'
    ) THEN
        CREATE INDEX idx_reviews_status ON public.reviews(status);
    END IF;
END
$$;
