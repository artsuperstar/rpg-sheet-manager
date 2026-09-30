# RPG Fichas

Aplicação independente para fichas de RPG. A seleção entre D&D e Ordem Paranormal funciona pelo parâmetro `?system=` do URL. Os dois sistemas possuem fichas funcionais e coleções independentes.

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
- D&D e Ordem usam modelos, factories e validators próprios. Nenhuma key dos aplicativos antigos é lida.

## D&D na Etapa 4C

- `systems/dnd` contém o modelo real, defaults, validator, regras e painéis. Bônus de perícias e salvaguardas são totais editáveis; mudar um atributo ajusta os totais pela diferença do modificador e preserva ajustes manuais.
- `DndWorkspace` controla coleção, navegação, empty state, confirmação de exclusão e status de persistência. `DndSheet` recebe apenas a ficha e `onChange`; todas as alterações confirmadas usam `updateActive` da infraestrutura 4B.
- Identidade, atributos, combate estável, ataques e slots usam rascunho com salvar/cancelar. PV atual/temporário, moedas, equipamento, uso de slots/habilidades e notas são imediatos. Trocar de personagem desmonta a ficha pelo ID e descarta rascunhos não confirmados.
- `shared/ui/NumberInput` trata texto vazio temporário, valores inválidos e limites no commit ao perder o foco. `shared/ui/CharacterSidebar` recebe apenas `id`, `name`, `summary` e callbacks de navegação. Sua API visual é provisória até a implementação real de Ordem.
- O visual mantém pergaminho claro, vinho, Cinzel, sidebar escura e logo usado no menu mobile. O cabeçalho global do aplicativo e o seletor de sistema são diferenças estruturais intencionais em relação ao aplicativo D&D antigo. Baselines de 390 e 1440 px ficam em `tests/__screenshots__`.
- Não há migração ou leitura das keys `adventurers-ledger-v1` e `adventurers-ledger-v2`, nem normalização de fichas históricas.

## Ordem Paranormal na Etapa 4D

- `systems/ordem` contém modelo, defaults, regras, validação e painéis próprios. As perícias persistem treino e outros bônus por ID; nomes, atributos associados e marcadores vêm de `rules.ts`.
- Patente, crédito, limites por categoria, carga atual e bônus exibido de perícia são derivados dos dados de entrada. Ataques, inventário, habilidades e rituais mantêm modelos separados dos conceitos de D&D.
- `OrdemWorkspace` usa a mesma coleção e persistência da Etapa 4B e mantém a ficha ativa mesmo quando D&D está visível. `OrdemSheet` recebe apenas a ficha e `onChange`; sua navegação por seções pertence exclusivamente a Ordem.
- Identidade, atributos/perícias, máximos de recursos e dados de combate, ataques, inventário, habilidades e rituais usam rascunho com salvar/cancelar. Recursos atuais e notas são imediatos. Trocar de ficha descarta rascunhos não confirmados.
- A identidade visual escura e a navegação por seções foram adaptadas em CSS Module, com capturas de 390 e 1440 px em `tests/__screenshots__`. O cabeçalho global é uma diferença estrutural intencional em relação ao aplicativo antigo.
- A sidebar compartilhada foi validada pelos dois sistemas usando apenas itens `{id, name, summary}` e textos de interface configuráveis. D&D mantém o recolhimento no desktop; Ordem não precisa dele. `NumberInput` atende os campos numéricos dos dois sistemas.
- Não há migração ou leitura de `arquivo-de-agentes-v1` nem normalização de fichas históricas.
