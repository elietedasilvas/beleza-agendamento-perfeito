import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SettingsMap = {
  [key: string]: string;
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  // Carregar todas as configurações
  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      // Converter array para objeto
      const settingsMap: SettingsMap = {};
      data.forEach((item: { key: string; value: string }) => {
        settingsMap[item.key] = item.value;
      });

      setSettings(settingsMap);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar uma configuração
  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      // Atualizar o estado local
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      return { success: true };
    } catch (error: any) {
      console.error(`Erro ao atualizar configuração ${key}:`, error);
      toast.error(`Erro ao atualizar configuração: ${error.message}`);
      return { success: false, error };
    }
  };

  // Atualizar múltiplas configurações
  const updateSettings = async (newSettings: SettingsMap) => {
    try {
      console.log('Atualizando configurações:', newSettings);

      // Primeiro, buscar todas as configurações existentes
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('key');

      if (fetchError) {
        console.error('Erro ao buscar configurações existentes:', fetchError);
        throw fetchError;
      }

      // Criar um conjunto de chaves existentes para fácil verificação
      const existingKeys = new Set(existingSettings.map((s: any) => s.key));
      console.log('Chaves existentes:', Array.from(existingKeys));

      // Separar configurações para atualizar e para inserir
      const toUpdate: [string, string][] = [];
      const toInsert: {key: string, value: string}[] = [];

      Object.entries(newSettings).forEach(([key, value]) => {
        if (existingKeys.has(key)) {
          toUpdate.push([key, value]);
        } else {
          toInsert.push({
            key,
            value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });

      console.log(`Configurações para atualizar: ${toUpdate.length}, para inserir: ${toInsert.length}`);

      // Processar atualizações
      const updatePromises = toUpdate.map(([key, value]) => {
        return supabase
          .from('settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);
      });

      // Processar inserções (se houver)
      let insertResult = { error: null };
      if (toInsert.length > 0) {
        console.log('Inserindo novas configurações:', toInsert);
        insertResult = await supabase
          .from('settings')
          .insert(toInsert);

        if (insertResult.error) {
          console.error('Erro ao inserir configurações:', insertResult.error);

          // Tentar inserir uma por uma para identificar qual está causando o problema
          console.log('Tentando inserir configurações individualmente...');
          const individualInsertResults = await Promise.all(
            toInsert.map(async (item) => {
              const result = await supabase
                .from('settings')
                .insert([item]);

              if (result.error) {
                console.error(`Erro ao inserir configuração ${item.key}:`, result.error);
              } else {
                console.log(`Configuração ${item.key} inserida com sucesso`);
              }

              return result;
            })
          );

          const individualErrors = individualInsertResults.filter(r => r.error);
          if (individualErrors.length === 0) {
            // Se todas as inserções individuais foram bem-sucedidas, limpar o erro original
            insertResult.error = null;
          }
        }
      }

      // Executar todas as promessas de atualização
      console.log('Atualizando configurações existentes...');
      const updateResults = await Promise.all(updatePromises);

      // Verificar se houve algum erro
      const updateErrors = updateResults.filter(result => result.error);

      if (updateErrors.length > 0) {
        console.error('Erros ao atualizar configurações:', updateErrors);

        // Tentar atualizar uma por uma para identificar qual está causando o problema
        console.log('Tentando atualizar configurações individualmente...');
        for (let i = 0; i < toUpdate.length; i++) {
          const [key, value] = toUpdate[i];
          if (updateResults[i].error) {
            console.log(`Tentando atualizar configuração ${key} individualmente...`);
            const result = await supabase
              .from('settings')
              .update({ value, updated_at: new Date().toISOString() })
              .eq('key', key);

            if (result.error) {
              console.error(`Erro ao atualizar configuração ${key}:`, result.error);
            } else {
              console.log(`Configuração ${key} atualizada com sucesso`);
              // Corrigir o resultado original
              updateResults[i] = result;
            }
          }
        }
      }

      // Verificar novamente se ainda há erros
      const remainingUpdateErrors = updateResults.filter(result => result.error);

      if (insertResult.error || remainingUpdateErrors.length > 0) {
        const errorCount = (insertResult.error ? 1 : 0) + remainingUpdateErrors.length;
        const errorMessage = `${errorCount} erros ao atualizar configurações`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Atualizar o estado local
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);

      // Verificar se o erro é de permissão
      const isPermissionError = error.message?.includes('permission') ||
                               error.message?.includes('policy') ||
                               error.message?.includes('access');

      if (isPermissionError) {
        toast.error('Erro de permissão: Você não tem permissão para atualizar configurações. Verifique se você está logado como administrador.');
      } else {
        toast.error(`Erro ao atualizar configurações: ${error.message}`);
      }

      // Tentar recarregar as configurações para garantir que o estado está atualizado
      loadSettings();

      return { success: false, error };
    }
  };

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    loadSettings,
    updateSetting,
    updateSettings
  };
};
