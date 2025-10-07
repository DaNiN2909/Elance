# Relatório de Ajustes e Pontos de Atenção

Este pacote adiciona uma **camada RF** (pasta `rf/`) sem remover ou sobrescrever seus arquivos originais.

## O que foi adicionado
- Páginas e scripts para RF001–RF013 (cadastro/login, perfil, portfólio, feed, curtidas, comentários, solicitações de conexão, aceitar/recusar, mensagens com restrição + solicitação, sugestões por afinidade, denúncias e fila de moderação).
- Botão flutuante em `index.html` apontando para `rf/index.html` (se `index.html` existir na raíz), **não-invasivo**.

## Possíveis problemas comuns observados em projetos similares
- **IDs de inputs** de login/cadastro não batendo com funções JS (ex.: `lg_email` vs `loginEmail`). A camada RF padroniza para `lg_email`, `lg_pass`, `rg_*`.
- **Scripts não importados** em todas as páginas (funções `login()`, `register()`, etc.). A camada RF já injeta `login.js` em suas páginas.
- **Conexões criando amizade automática** sem fluxo de solicitação. A camada RF implementa `sendFriendRequest / acceptFriend / rejectFriend`.
- **Mensagens liberadas para qualquer usuário**. Agora só amigos conversam direto; não amigos geram **solicitação de mensagem**.
- **Sugestões de amigos aleatórias**. Agora há uma heurística por tipo/instrumentos/gêneros.
- **Ausência de denúncia/moderação**. Incluímos `reportPost`, `reportUser` e uma fila simples com status `pending/resolved/dismissed`.

## Como testar rapidamente
1. Abra `index.html` da raíz; use o botão **Abrir Camada RF** (ou abra `rf/index.html` direto).
2. Cadastre 2 usuários (uma aba anônima ajuda).
3. Faça post no feed, curta/comente.
4. Envie **solicitação de conexão**, aceite/recuse em `rf/connections.html`.
5. Troque mensagens (para não amigos vira **solicitação**).
6. Faça denúncias no feed ou em conexões e verifique em `rf/notifications.html`.
