import { NumberInput } from '../../../shared/ui/NumberInput'
import type { DndCharacter } from '../model'
import styles from '../styles/dnd.module.css'
import { useI18n } from '../../../i18n/useI18n'

const coins = ['cp', 'sp', 'ep', 'gp', 'pp'] as const

export function EquipmentPanel({ character, onChange }: {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}) {
  const { dnd: t } = useI18n()
  return (
    <section className={`${styles.card} ${styles.equipment}`} aria-label={t('Equipment')}>
      <div className={styles.sectionHeading}><h3>{t('Equipment')}</h3>
        <button className={styles.button} type="button" onClick={() => onChange((current) => ({
          ...current, equipment: [...current.equipment, { id: crypto.randomUUID(), name: '', quantity: 1 }],
        }))}>{t('Add item')}</button>
      </div>
      <div className={styles.equipmentLayout}>
        <div className={styles.currency}><h4>{t('Currency')}</h4>{coins.map((coin) => (
          <NumberInput key={coin} label={coin.toUpperCase()} min={0} value={character.currency[coin]}
            onChange={(amount) => onChange((current) => ({ ...current, currency: { ...current.currency, [coin]: amount } }))} />
        ))}</div>
        <div className={styles.inventory}><h4>{t('Inventory')}</h4>
          {character.equipment.length === 0 && <p className={styles.emptyHint}>{t('Your pack is empty.')}</p>}
          {character.equipment.map((item) => (
            <div className={styles.equipmentRow} key={item.id}>
              <label className={styles.visuallyHidden} htmlFor={`item-${item.id}`}>{t('Item name')}</label>
              <input id={`item-${item.id}`} aria-label={t('Item name')} placeholder={t('Item name')} value={item.name}
                onChange={(event) => {
                  const name = event.target.value
                  onChange((current) => ({ ...current, equipment: current.equipment.map((entry) =>
                    entry.id === item.id ? { ...entry, name } : entry) }))
                }} />
              <NumberInput label={t('Quantity')} min={0} value={item.quantity}
                onChange={(quantity) => onChange((current) => ({ ...current, equipment: current.equipment.map((entry) =>
                  entry.id === item.id ? { ...entry, quantity } : entry) }))} />
              <button className={styles.iconButton} type="button" aria-label={`${t('Remove')} ${item.name || t('item')}`}
                onClick={() => onChange((current) => ({ ...current, equipment: current.equipment.filter(({ id }) => id !== item.id) }))}>×</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
