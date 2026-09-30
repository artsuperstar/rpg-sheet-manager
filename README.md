# Dicebound

Dicebound é um aplicativo local de fichas para D&D e Ordem Paranormal, com interface em português (Brasil) e inglês. A tela inicial permite escolher o sistema; `?system=dnd` e `?system=ordem` abrem cada um diretamente. Cada sistema mantém sua própria coleção e ficha ativa. É possível começar sem fichas e excluir a última.

## Executar

```sh
npm install
npm run dev
```

## Verificar

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

## Organização e dados

- `src/app` cuida da composição global, do seletor e do URL.
- `src/shared` contém a coleção, persistência e componentes de interface usados pelos dois sistemas, sem regras de RPG.
- `src/systems/dnd` e `src/systems/ordem` contêm modelos, validação, regras, fichas e visual próprios.
- A marca global usa os dois D20; a caneca identifica D&D e o sigilo identifica Ordem. A preferência de idioma é global e fica em `rpg-fichas:preferences:locale`, separada dos dados das fichas.
- Os dados ficam apenas no `localStorage` deste navegador, em `rpg-fichas:v1:<system>:index` e `rpg-fichas:v1:<system>:character:<id>`. Não há backend nem sincronização entre dispositivos.
- Dados dos aplicativos antigos não são lidos ou migrados. O aplicativo começa com uma coleção nova para cada sistema.
- Se uma gravação falhar, a alteração permanece em memória durante a sessão e a interface oferece nova tentativa. Dados inválidos no armazenamento são preservados e exibem erro de leitura.

## Decisões técnicas

- Os dois Workspaces permanecem montados ao trocar o sistema para preservar coleção, ficha ativa e erro pendente. As Sheets desmontam; rascunhos não salvos são descartados.
- Cada edição confirmada atualiza a memória antes de tentar gravar. A persistência acontece na ação, não em um effect que observa state. O repository escreve registros, depois o índice e por último remove registros excluídos; um retry reconcilia falhas parciais.
- Cada coleção mantém seu listener simples de `beforeunload`. Qualquer `write-error` protege a saída sem um gerenciador global de estado.
- `shared/ui` contém a sidebar, o campo numérico e os pequenos comportamentos iguais de menu móvel e foco de editor. Layout e aparência dos controles continuam nos sistemas.
- Regras, modelos, validators, defaults, Sheets e painéis de D&D e Ordem continuam separados. `shared/validation.ts` contém apenas uma verificação estrutural de objeto.
- `tests/fixtures/storageV1.json` foi capturado do aplicativo antes da refatoração da Etapa 5. O teste de compatibilidade carrega, edita e recarrega esses dados sem alterar o formato v1.
