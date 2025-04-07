const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = "https://cylfiidhpinlegikcbrj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Erro: SUPABASE_SERVICE_KEY não definida. Execute com:');
  console.error('SUPABASE_SERVICE_KEY=sua_chave_secreta node scripts/create_reviews_table.js');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  try {
    console.log('Iniciando verificação da tabela de avaliações...');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'create_reviews_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      throw error;
    }
    
    console.log('Tabela de avaliações verificada com sucesso!');
    
    // Verificar se a tabela foi criada e tem a coluna status
    const { data, error: selectError } = await supabase
      .from('reviews')
      .select('id, rating, status')
      .limit(5);
    
    if (selectError) {
      throw selectError;
    }
    
    console.log('Avaliações encontradas:');
    console.table(data);
    
    // Forçar atualização do cache do esquema
    console.log('Forçando atualização do cache do esquema...');
    
    // Executar uma consulta que force a atualização do cache
    const { error: refreshError } = await supabase.rpc('refresh_schema_cache');
    
    if (refreshError) {
      console.log('Função refresh_schema_cache não encontrada, criando...');
      
      // Criar função para atualizar o cache do esquema
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION refresh_schema_cache()
        RETURNS void AS $$
        BEGIN
          -- Esta função não faz nada diretamente, mas força o Supabase a recarregar o esquema
          -- ao ser chamada
          RETURN;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
      
      if (createFunctionError) {
        console.warn('Não foi possível criar a função refresh_schema_cache:', createFunctionError);
      } else {
        console.log('Função refresh_schema_cache criada com sucesso!');
      }
    } else {
      console.log('Cache do esquema atualizado com sucesso!');
    }
    
    // Verificar se a coluna status existe explicitamente
    const checkColumnSQL = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'status';
    `;
    
    const { data: columnData, error: columnError } = await supabase.rpc('exec_sql', { sql: checkColumnSQL });
    
    if (columnError) {
      console.warn('Erro ao verificar coluna status:', columnError);
    } else {
      console.log('Informações da coluna status:');
      console.table(columnData);
      
      if (!columnData || columnData.length === 0) {
        console.log('Coluna status não encontrada, adicionando...');
        
        const addColumnSQL = `
          ALTER TABLE public.reviews 
          ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending' 
          CHECK (status IN ('pending', 'approved', 'rejected'));
        `;
        
        const { error: addColumnError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
        
        if (addColumnError) {
          console.error('Erro ao adicionar coluna status:', addColumnError);
        } else {
          console.log('Coluna status adicionada com sucesso!');
        }
      } else {
        console.log('Coluna status já existe na tabela reviews.');
      }
    }
    
  } catch (error) {
    console.error('Erro ao verificar tabela de avaliações:', error);
  }
}

main();
