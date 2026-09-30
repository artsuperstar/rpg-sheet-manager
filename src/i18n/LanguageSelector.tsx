import { useI18n } from './useI18n'
import styles from '../shared/styles/shell.module.css'

export function LanguageSelector({ placement = 'header' }: { placement?: 'header' | 'sidebar' | 'landing' }) {
  const { locale, setLocale, global: t } = useI18n()
  return <div className={styles.languageSelector} data-placement={placement} role="group" aria-label={t('Idioma')}>
    <span className={styles.languageLabel}>{t('Idioma')}</span>
    <div className={styles.languageButtons}>
      <button type="button" lang="pt-BR" aria-pressed={locale === 'pt-BR'} onClick={() => setLocale('pt-BR')}>Português</button>
      <button type="button" lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button>
    </div>
  </div>
}
