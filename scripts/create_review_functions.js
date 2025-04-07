const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = "https://cylfiidhpinlegikcbrj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Erro: SUPABASE_SERVICE_KEY não definida. Execute com:');
  console.error('SUPABASE_SERVICE_KEY=sua_chave_secreta node scripts/create_review_functions.js');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  try {
    console.log('Criando funções para gerenciamento de avaliações...');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'create_review_functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      throw error;
    }
    
    console.log('Funções criadas com sucesso!');
    
    // Testar a função
    console.log('Testando a função update_review_status...');
    
    // Buscar uma avaliação para teste
    const { data: reviews, error: fetchError } = await supabase
      .from('reviews')
      .select('id, status')
      .limit(1);
    
    if (fetchError) {
      console.warn('Não foi possível buscar avaliações para teste:', fetchError);
    } else if (reviews && reviews.length > 0) {
      const testReview = reviews[0];
      console.log(`Avaliação para teste: ID=${testReview.id}, Status atual=${testReview.status}`);
      
      // Definir novo status (diferente do atual)
      const newStatus = testReview.status === 'approved' ? 'pending' : 'approved';
      
      // Testar a função
      const { error: testError } = await supabase.rpc('update_review_status', {
        review_id: testReview.id,
        new_status: newStatus
      });
      
      if (testError) {
        console.error('Erro ao testar a função:', testError);
      } else {
        console.log(`Status atualizado com sucesso para: ${newStatus}`);
        
        // Verificar se a atualização foi bem-sucedida
        const { data: updatedReview, error: verifyError } = await supabase
          .from('reviews')
          .select('id, status')
          .eq('id', testReview.id)
          .single();
        
        if (verifyError) {
          console.error('Erro ao verificar atualização:', verifyError);
        } else {
          console.log(`Status verificado: ${updatedReview.status}`);
          
          if (updatedReview.status === newStatus) {
            console.log('Função testada com sucesso!');
          } else {
            console.warn('Função não atualizou o status corretamente!');
          }
        }
      }
    } else {
      console.warn('Nenhuma avaliação encontrada para teste.');
    }
    
  } catch (error) {
    console.error('Erro ao criar funções:', error);
  }
}

main();
