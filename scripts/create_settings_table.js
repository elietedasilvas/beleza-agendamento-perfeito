const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = "https://cylfiidhpinlegikcbrj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Erro: SUPABASE_SERVICE_KEY não definida. Execute com:');
  console.error('SUPABASE_SERVICE_KEY=sua_chave_secreta node scripts/create_settings_table.js');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  try {
    console.log('Iniciando criação da tabela de configurações...');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'create_settings_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      throw error;
    }
    
    console.log('Tabela de configurações criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const { data, error: selectError } = await supabase
      .from('settings')
      .select('key, value')
      .limit(5);
    
    if (selectError) {
      throw selectError;
    }
    
    console.log('Configurações iniciais:');
    console.table(data);
    
  } catch (error) {
    console.error('Erro ao criar tabela de configurações:', error);
  }
}

main();
