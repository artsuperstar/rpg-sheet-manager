# RPG Fichas

Aplicação independente para fichas de RPG. A seleção entre D&D e Ordem Paranormal funciona pelo parâmetro `?system=` do URL. A Etapa 4B acrescenta coleção e persistência com modelos e interface temporários; fichas e regras reais ainda não foram migradas.

## Desenvolvimento

```sh
npm install
npm run dev
```

## Verificação

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

## Limites entre módulos

- `app` compõe o seletor e os sistemas.
- `shared` contém apenas estrutura e comportamento comprovadamente independente de RPG; não importa `app` nem `systems`.
- Cada pasta em `systems` contém apenas seu próprio RPG e pode importar `shared`, mas não outro sistema nem `app`.
- A UI de um sistema não deve colocar suas regras de domínio em `shared`.

Uma abstração que funcione para D&D ainda não está comprovada como compartilhada. Ao implementar Ordem, se forem necessárias flags, branches, props excessivas, exceções ou casts específicos, reavalie a abstração antes de ampliá-la.

## Coleção e persistência da Etapa 4B

- Cada workspace mantém seu próprio snapshot em memória e seu status de persistência. Os dois continuam montados ao trocar o sistema no URL.
- `CollectionSnapshot<T>` usa um array ordenado de fichas com `id` próprio e `activeCharacterId: string | null`. Zero fichas é válido e não cria dados automaticamente.
- As keys seguem `rpg-fichas:v1:<system>:index` e `rpg-fichas:v1:<system>:character:<id>`. O índice contém `version`, `system`, `characterIds` e `activeCharacterId`; cada registro contém `version`, `system` e `data`.
- O repository valida o índice, o envelope e o payload específico do sistema antes de aceitar dados. Um índice ausente com registros órfãos, JSON inválido, versão desconhecida, IDs duplicados, registro ausente e discriminante incompatível produzem `read-error`, sem autosave ou reset.
- Em cada ação, o hook calcula o próximo snapshot, atualiza a memória e tenta gravar sincronamente. Registros novos ou alterados são gravados antes do índice; registros excluídos são removidos depois. Registros sem mudança de referência não são regravados.
- Após `write-error`, uma nova ação tenta salvar novamente o snapshot mais recente. `retry()` faz o mesmo após a falha ser resolvida. A UI mantém as mudanças em memória; `beforeunload` usa o aviso nativo enquanto houver escrita pendente.
- Ao excluir a ficha ativa, a próxima na ordem vira ativa; se ela era a última da lista, a anterior vira ativa. Ao excluir a última ficha, o índice fica vazio e `activeCharacterId` vira `null`.
- D&D e Ordem usam factories e validators temporários separados, contendo apenas `id` e `name`. Eles serão substituídos pelos modelos próprios nas etapas 4C/4D. Nenhuma key dos aplicativos antigos é lida.
