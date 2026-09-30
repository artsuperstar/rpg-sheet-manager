const NAMESPACE = 'rpg-fichas'

export function systemKeys(system: string) {
  const prefix = `${NAMESPACE}:v1:${system}:`
  const characterPrefix = `${prefix}character:`

  return {
    index: `${prefix}index`,
    characterPrefix,
    character: (id: string) => `${characterPrefix}${id}`,
  }
}
