-- Função para atualizar o status de uma avaliação
CREATE OR REPLACE FUNCTION update_review_status(review_id UUID, new_status TEXT)
RETURNS VOID AS $$
BEGIN
    -- Verificar se o status é válido
    IF new_status NOT IN ('pending', 'approved', 'rejected') THEN
        RAISE EXCEPTION 'Status inválido: %. Os valores permitidos são: pending, approved, rejected', new_status;
    END IF;
    
    -- Atualizar o status da avaliação
    UPDATE public.reviews
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE id = review_id;
    
    -- Verificar se a avaliação foi encontrada
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Avaliação com ID % não encontrada', review_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
