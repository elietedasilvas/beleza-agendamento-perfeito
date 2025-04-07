-- Verificar se a tabela já existe
DO $$
BEGIN
    -- Criar a tabela se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'settings') THEN
        CREATE TABLE public.settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            key VARCHAR(255) NOT NULL UNIQUE,
            value TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Inserir configurações padrão
        INSERT INTO public.settings (key, value) VALUES 
            ('hero_image', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'),
            ('hero_title', 'Agende seu momento de beleza e bem-estar'),
            ('hero_subtitle', 'Reserve serviços de estética e barbearia com os melhores profissionais da cidade'),
            ('salon_name', 'Beauty Spa & Barbearia'),
            ('salon_address', 'Rua das Flores, 123 - São Paulo, SP'),
            ('salon_phone', '(11) 99123-4567'),
            ('salon_email', 'contato@beautyspa.com'),
            ('salon_website', 'www.beautyspa.com'),
            ('salon_instagram', 'beautyspa'),
            ('salon_facebook', 'beautyspaoficial'),
            ('salon_twitter', 'beautyspa'),
            ('about_text', 'Beauty Spa & Barbearia é um espaço dedicado à beleza e bem-estar, oferecendo serviços de alta qualidade para cuidados com cabelo, rosto, corpo e barbearia. Nossa equipe de profissionais qualificados está comprometida em proporcionar uma experiência única.'),
            ('opening_hours_monday', '9:00 - 19:00'),
            ('opening_hours_tuesday', '9:00 - 19:00'),
            ('opening_hours_wednesday', '9:00 - 19:00'),
            ('opening_hours_thursday', '9:00 - 19:00'),
            ('opening_hours_friday', '9:00 - 19:00'),
            ('opening_hours_saturday', '9:00 - 17:00'),
            ('opening_hours_sunday', 'Fechado'),
            ('booking_advance_days', '30'),
            ('booking_time_slot', '30'),
            ('booking_auto_confirm', 'true'),
            ('booking_send_reminders', 'true');
    END IF;
END
$$;

-- Adicionar políticas RLS para a tabela de configurações
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos possam ler as configurações
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'settings'
        AND policyname = 'Todos podem ler configurações'
    ) THEN
        EXECUTE 'CREATE POLICY "Todos podem ler configurações" ON public.settings
            FOR SELECT
            TO anon, authenticated
            USING (true)';
    END IF;
END
$$;

-- Política para permitir que apenas administradores possam modificar as configurações
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'settings'
        AND policyname = 'Admins podem gerenciar configurações'
    ) THEN
        EXECUTE 'CREATE POLICY "Admins podem gerenciar configurações" ON public.settings
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
    -- Criar o trigger se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON public.settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;
