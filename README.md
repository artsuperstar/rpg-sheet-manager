# RPG Fichas

Aplicação independente para fichas de RPG. Nesta fundação, a seleção entre D&D e Ordem Paranormal funciona pelo parâmetro `?system=` do URL. Ainda não há fichas nem persistência.

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
