import { useState } from 'react'
import { useCharacterCollection } from '../../src/shared/collection/useCharacterCollection'
import { createRepository } from '../../src/shared/persistence/repository'
import { createDefaultDndCharacter } from '../../src/systems/dnd/defaults'
import { isDndCharacter } from '../../src/systems/dnd/validation'
import { createDefaultOrdemCharacter } from '../../src/systems/ordem/defaults'
import { isOrdemCharacter } from '../../src/systems/ordem/validation'

const dndRepository = createRepository('probe-dnd', isDndCharacter)
const ordemRepository = createRepository('probe-ordem', isOrdemCharacter)

function DndProbe() {
  const collection = useCharacterCollection(dndRepository, createDefaultDndCharacter)
  const [result, setResult] = useState('')
  return <section aria-label="D&D ID probe">
    <button type="button" onClick={collection.create}>Create</button>
    <button type="button" onClick={() => {
      try {
        collection.updateActive((character) => ({ ...character, id: 'tampered' }))
        setResult('allowed')
      } catch { setResult('blocked') }
    }}>Change ID</button>
    <output>{result}</output>
  </section>
}

function OrdemProbe() {
  const collection = useCharacterCollection(ordemRepository, createDefaultOrdemCharacter)
  const [result, setResult] = useState('')
  return <section aria-label="Ordem ID probe">
    <button type="button" onClick={collection.create}>Create</button>
    <button type="button" onClick={() => {
      try {
        collection.updateActive((character) => ({ ...character, id: 'tampered' }))
        setResult('allowed')
      } catch { setResult('blocked') }
    }}>Change ID</button>
    <output>{result}</output>
  </section>
}

export function IdInvariantHarness() {
  return <><DndProbe /><OrdemProbe /></>
}
