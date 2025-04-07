const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = "https://cylfiidhpinlegikcbrj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Erro: SUPABASE_SERVICE_KEY não definida. Execute com:');
  console.error('SUPABASE_SERVICE_KEY=sua_chave_secreta node scripts/fix_settings_permissions.js');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  try {
    console.log('Verificando e corrigindo permissões da tabela de configurações...');
    
    // Verificar se a tabela existe
    const checkTableSQL = `
      SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'settings'
      );
    `;
    
    const { data: tableExists, error: tableError } = await supabase.rpc('exec_sql', { sql: checkTableSQL });
    
    if (tableError) {
      throw tableError;
    }
    
    if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
      console.log('Tabela settings não existe. Criando...');
      
      // Ler o arquivo SQL
      const sqlFilePath = path.join(__dirname, '..', 'sql', 'create_settings_table.sql');
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      // Executar o SQL
      const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
      
      if (error) {
        throw error;
      }
      
      console.log('Tabela de configurações criada com sucesso!');
    } else {
      console.log('Tabela settings já existe.');
    }
    
    // Verificar se o RLS está habilitado
    const checkRLSSQL = `
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = 'settings';
    `;
    
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', { sql: checkRLSSQL });
    
    if (rlsError) {
      throw rlsError;
    }
    
    const rlsEnabled = rlsData && rlsData[0] && rlsData[0].relrowsecurity;
    
    if (!rlsEnabled) {
      console.log('RLS não está habilitado para a tabela settings. Habilitando...');
      
      const enableRLSSQL = `
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql: enableRLSSQL });
      
      if (error) {
        throw error;
      }
      
      console.log('RLS habilitado com sucesso!');
    } else {
      console.log('RLS já está habilitado para a tabela settings.');
    }
    
    // Verificar políticas existentes
    const checkPoliciesSQL = `
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = 'settings';
    `;
    
    const { data: policiesData, error: policiesError } = await supabase.rpc('exec_sql', { sql: checkPoliciesSQL });
    
    if (policiesError) {
      throw policiesError;
    }
    
    const policies = policiesData || [];
    const policyNames = policies.map(p => p.policyname);
    
    console.log('Políticas existentes:', policyNames);
    
    // Criar política de leitura se não existir
    if (!policyNames.includes('Todos podem ler configurações')) {
      console.log('Criando política de leitura...');
      
      const createReadPolicySQL = `
        CREATE POLICY "Todos podem ler configurações" ON public.settings
        FOR SELECT
        TO anon, authenticated
        USING (true);
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql: createReadPolicySQL });
      
      if (error) {
        console.error('Erro ao criar política de leitura:', error);
      } else {
        console.log('Política de leitura criada com sucesso!');
      }
    }
    
    // Criar política de administração se não existir
    if (!policyNames.includes('Admins podem gerenciar configurações')) {
      console.log('Criando política de administração...');
      
      const createAdminPolicySQL = `
        CREATE POLICY "Admins podem gerenciar configurações" ON public.settings
        FOR ALL
        TO authenticated
        USING (EXISTS (
          SELECT 1 FROM auth.users
          JOIN public.profiles ON auth.users.id = public.profiles.id
          WHERE auth.users.id = auth.uid() AND public.profiles.role = 'admin'
        ));
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql: createAdminPolicySQL });
      
      if (error) {
        console.error('Erro ao criar política de administração:', error);
      } else {
        console.log('Política de administração criada com sucesso!');
      }
    }
    
    // Verificar se há configurações na tabela
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .limit(5);
    
    if (settingsError) {
      console.error('Erro ao verificar configurações:', settingsError);
    } else {
      console.log(`Encontradas ${settingsData.length} configurações:`);
      console.table(settingsData);
    }
    
    // Testar inserção de uma configuração de teste
    console.log('Testando inserção de configuração...');
    
    const testKey = `test_key_${Date.now()}`;
    const { error: insertError } = await supabase
      .from('settings')
      .insert([
        { key: testKey, value: 'test_value', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]);
    
    if (insertError) {
      console.error('Erro ao inserir configuração de teste:', insertError);
    } else {
      console.log('Configuração de teste inserida com sucesso!');
      
      // Remover a configuração de teste
      const { error: deleteError } = await supabase
        .from('settings')
        .delete()
        .eq('key', testKey);
      
      if (deleteError) {
        console.error('Erro ao remover configuração de teste:', deleteError);
      } else {
        console.log('Configuração de teste removida com sucesso!');
      }
    }
    
    console.log('Verificação e correção de permissões concluída!');
    
  } catch (error) {
    console.error('Erro ao verificar e corrigir permissões:', error);
  }
}

main();
