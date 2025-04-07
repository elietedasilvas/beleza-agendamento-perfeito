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
      // Criar um array de promessas para atualizar cada configuração
      const promises = Object.entries(newSettings).map(([key, value]) => {
        return supabase
          .from('settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);
      });

      // Executar todas as promessas
      const results = await Promise.all(promises);
      
      // Verificar se houve algum erro
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} erros ao atualizar configurações`);
      }

      // Atualizar o estado local
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
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
