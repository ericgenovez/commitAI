import i18next from 'i18next';
import { loadConfig } from '../config/loader';
import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';
import es from '../locales/es.json';

export async function initI18n() {
  const config = loadConfig();
  const lng = config.cliLanguage || config.language || 'en';

  await i18next.init({
    lng,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
      es: { translation: es },
    },
  });
}

export const t = (key: string, options?: any) => i18next.t(key, options) as string;
