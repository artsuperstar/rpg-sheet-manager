import { useCharacterCollection } from '../../shared/collection/useCharacterCollection'
import styles from '../../shared/styles/shell.module.css'
import { createDndPlaceholderCharacter } from './placeholderModel'
import { dndRepository } from './persistence'

interface DndWorkspaceProps {
  active: boolean
}

export function DndWorkspace({ active }: DndWorkspaceProps) {
  const collection = useCharacterCollection(dndRepository, createDndPlaceholderCharacter)
  if (!active) return null

  return (
    <section className={styles.workspace} aria-labelledby="dnd-workspace-heading">
      <p className={styles.kicker}>Área do sistema</p>
      <h2 id="dnd-workspace-heading">D&D</h2>
      <p>Interface temporária para testar coleção e persistência.</p>
      {collection.status.type === 'read-error' ? (
        <div role="alert" className={styles.error}>
          <p>Erro de leitura: {collection.status.error.message}</p>
          <button type="button" onClick={collection.retryLoad}>Tentar ler novamente</button>
        </div>
      ) : (
        <>
          <p role="status">{collection.status.type === 'saved'
            ? 'Salvo'
            : `Erro de escrita: ${collection.status.error.message}`}</p>
          {collection.status.type === 'write-error' && (
            <button type="button" onClick={collection.retry}>Tentar salvar novamente</button>
          )}
          <p>Quantidade de fichas: {collection.snapshot?.characters.length}</p>
          {collection.snapshot?.characters.length === 0 && <p>Nenhuma ficha criada.</p>}
          <button type="button" onClick={collection.create}>Criar ficha</button>
          <ul className={styles.collectionList} aria-label="Fichas de D&D">
            {collection.snapshot?.characters.map((character) => (
              <li className={styles.collectionItem} key={character.id}>
                <button type="button" disabled={character.id === collection.snapshot?.activeCharacterId}
                  onClick={() => collection.select(character.id)}>
                  {character.name}
                </button>
                <button type="button" onClick={() => collection.remove(character.id)}>
                  Excluir {character.name}
                </button>
              </li>
            ))}
          </ul>
          {collection.activeCharacter && (
            <label className={styles.nameField}>
              Nome da ficha ativa
              <input value={collection.activeCharacter.name} onChange={(event) => {
                const name = event.target.value
                collection.updateActive((current) => ({ ...current, name }))
              }} />
            </label>
          )}
        </>
      )}
    </section>
  )
}

