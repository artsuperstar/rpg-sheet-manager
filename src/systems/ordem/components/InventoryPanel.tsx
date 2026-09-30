import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { OrdemCharacter, OrdemInventoryItem } from '../model'
import { categoryCount, currentLoad, inventoryCategories, prestigeTier } from '../rules'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'
import { useI18n } from '../../../i18n/useI18n'

type Settings = OrdemCharacter['inventorySettings']
type Draft = { settings: Settings; items: OrdemInventoryItem[] }
function createItem(): OrdemInventoryItem {
  return { id: crypto.randomUUID(), name: '', category: '0', spaces: 0, description: '' }
}

export function InventoryPanel({ settings, items, onChange }: {
  settings: Settings; items: OrdemInventoryItem[]; onChange: (settings: Settings, items: OrdemInventoryItem[]) => void
}) {
  const { ordem: t } = useI18n()
  const [draft, setDraft] = useState<Draft | null>(null)
  const visibleSettings = draft?.settings ?? settings
  const visibleItems = draft?.items ?? items
  const tier = prestigeTier(visibleSettings.prestigePoints)
  const valid = draft !== null && Number.isSafeInteger(draft.settings.prestigePoints) && draft.settings.prestigePoints >= 0 &&
    Number.isFinite(draft.settings.maximumLoad) && draft.settings.maximumLoad >= 0 &&
    draft.items.every((item) => item.name.trim() && Number.isFinite(item.spaces) && item.spaces >= 0)
  function changeItem(id: string, changes: Partial<OrdemInventoryItem>) {
    setDraft((current) => current ? { ...current, items: current.items.map((item) => item.id === id ? { ...item, ...changes } : item) } : null)
  }
  return <section id="inventario" className={styles.card} aria-label={t('Inventário')}>
    <div className={styles.heading}><div><small>{t('Equipamento do agente')}</small><h2>{t('Inventário')}</h2></div>
      {!draft ? <EditButton label={t('Editar inventário')} onClick={() => setDraft({
        settings: { ...settings }, items: items.map((item) => ({ ...item })),
      })} /> : <EditorActions canSave={Boolean(valid)} onCancel={() => setDraft(null)} onSave={() => {
        if (!draft || !valid) return
        onChange(draft.settings, draft.items.map((item) => ({ ...item, name: item.name.trim(), description: item.description.trim() })))
        setDraft(null)
      }} />}</div>
    <div className={styles.inventoryOverview}>
      <div className={styles.summaryCell}>{draft ? <NumberInput label={t('Pontos de Prestígio')} min={0}
        value={draft.settings.prestigePoints} onChange={(prestigePoints) => setDraft((current) => current ? {
          ...current, settings: { ...current.settings, prestigePoints },
        } : null)} /> : <><span>{t('Pontos de Prestígio')}</span><strong>{settings.prestigePoints}</strong></>}</div>
      <div className={styles.summaryCell}><span>{t('Patente')}</span><strong>{t(tier.rank)}</strong></div>
      <div className={styles.summaryCell}><span>{t('Limite de Crédito')}</span><strong>{t(tier.creditLimit)}</strong></div>
      <div className={styles.summaryCell}><span>{t('Carga atual / máxima')}</span><strong>{currentLoad(visibleItems)} / {draft
        ? <NumberInput label={t('Carga máxima')} min={0} step="any" value={draft.settings.maximumLoad}
          onChange={(maximumLoad) => setDraft((current) => current ? { ...current, settings: { ...current.settings, maximumLoad } } : null)} />
        : settings.maximumLoad}</strong></div>
    </div>
    <div className={styles.limits}><h3>{t('Limite de itens por categoria')}</h3><div className={styles.limitGrid}>
      {inventoryCategories.slice(1).map((category, index) => {
        const count = categoryCount(visibleItems, category)
        const limit = tier.itemLimits[index]
        return <div className={styles.limit} data-over={count > (limit ?? 0)} key={category}
          aria-label={`${t('Categoria')} ${category}: ${count} ${t('itens')}, ${limit === null ? t('indisponível') : `${t('limite')} ${limit}`}`}>
          <span>{category}</span><strong>{count}/{limit ?? '—'}</strong></div>
      })}</div></div>
    {draft ? <div className={styles.editor} role="group" aria-label={t('Editar itens do inventário')}
      onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
      {draft.items.map((item, index) => <div className={styles.entryEditor} key={item.id}>
        <div className={styles.heading}><h3>{t('Item')} {index + 1}</h3><button type="button" className={styles.danger}
          aria-label={`${t('Remover')} ${t('item')} ${index + 1}`} onClick={() => setDraft((current) => current ? {
            ...current, items: current.items.filter(({ id }) => id !== item.id),
          } : null)}>{t('Remover')}</button></div>
        <div className={styles.formGrid}>
          <label className={styles.field}><span>{t('Nome do item')}</span><input value={item.name}
            onChange={(event) => changeItem(item.id, { name: event.target.value })} /></label>
          <label className={styles.field}><span>{t('Categoria')}</span><select value={item.category}
            onChange={(event) => {
              const category = inventoryCategories.find((entry) => entry === event.target.value)
              if (category) changeItem(item.id, { category })
            }}>
            {inventoryCategories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
          <NumberInput label={t('Espaços')} min={0} step="any" value={item.spaces}
            onChange={(spaces) => changeItem(item.id, { spaces })} />
          <label className={styles.field}><span>{t('Descrição')}</span><textarea value={item.description}
            onChange={(event) => changeItem(item.id, { description: event.target.value })} /></label>
        </div></div>)}
      <button type="button" onClick={() => setDraft((current) => current ? { ...current, items: [...current.items, createItem()] } : null)}>+ {t('Adicionar item')}</button>
    </div> : items.length === 0 ? <p className={styles.emptyPanel}>{t('Nenhum item registrado.')}</p>
      : <div className={styles.entryList}>{items.map((item) => <article className={styles.entryCard} key={item.id}>
        <h3>{item.name}</h3><small>{t('Categoria')} {item.category} · {item.spaces} {t('espaços')}</small>
        {item.description && <p>{item.description}</p>}
      </article>)}</div>}
  </section>
}
