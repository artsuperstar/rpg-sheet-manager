# RPG Fichas

Aplicação independente para fichas de RPG. A seleção entre D&D e Ordem Paranormal funciona pelo parâmetro `?system=` do URL. D&D possui ficha funcional desde a Etapa 4C; Ordem ainda usa o placeholder de infraestrutura da Etapa 4B.

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
- D&D usa modelo, factory e validator próprios. Ordem mantém seu factory e validator temporários até a Etapa 4D. Nenhuma key dos aplicativos antigos é lida.

## D&D na Etapa 4C

- `systems/dnd` contém o modelo real, defaults, validator, regras e painéis. Bônus de perícias e salvaguardas são totais editáveis; mudar um atributo ajusta os totais pela diferença do modificador e preserva ajustes manuais.
- `DndWorkspace` controla coleção, navegação, empty state, confirmação de exclusão e status de persistência. `DndSheet` recebe apenas a ficha e `onChange`; todas as alterações confirmadas usam `updateActive` da infraestrutura 4B.
- Identidade, atributos, combate estável, ataques e slots usam rascunho com salvar/cancelar. PV atual/temporário, moedas, equipamento, uso de slots/habilidades e notas são imediatos. Trocar de personagem desmonta a ficha pelo ID e descarta rascunhos não confirmados.
- `shared/ui/NumberInput` trata texto vazio temporário, valores inválidos e limites no commit ao perder o foco. `shared/ui/CharacterSidebar` recebe apenas `id`, `name`, `summary` e callbacks de navegação. Sua API visual é provisória até a implementação real de Ordem.
- O visual mantém pergaminho claro, vinho, Cinzel, sidebar escura e logo usado no menu mobile. O cabeçalho global do aplicativo e o seletor de sistema são diferenças estruturais intencionais em relação ao aplicativo D&D antigo. Baselines de 390 e 1440 px ficam em `tests/__screenshots__`.
- Não há migração ou leitura das keys `adventurers-ledger-v1` e `adventurers-ledger-v2`, nem normalização de fichas históricas.
