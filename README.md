# RPG Fichas

Aplicativo único de fichas para D&D e Ordem Paranormal. A tela inicial permite escolher o sistema; `?system=dnd` e `?system=ordem` abrem cada um diretamente. Cada sistema mantém sua própria coleção e ficha ativa. É possível começar sem fichas e excluir a última.

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
- Os dados ficam apenas no `localStorage` deste navegador, em `rpg-fichas:v1:<system>:index` e `rpg-fichas:v1:<system>:character:<id>`. Não há backend nem sincronização entre dispositivos.
- Dados dos aplicativos antigos não são lidos ou migrados. O aplicativo começa com uma coleção nova para cada sistema.
- Se uma gravação falhar, a alteração permanece em memória durante a sessão e a interface oferece nova tentativa. Dados inválidos no armazenamento são preservados e exibem erro de leitura.
