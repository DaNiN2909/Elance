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

### Fluxo de login/cadastro
Para validar especificamente a tela ajustada de login/cadastro:

1. **Suba um servidor estático** na pasta `frontend-demo/` (ex.: `npx http-server frontend-demo -p 4173`).
2. Acesse `http://localhost:4173/login.html` no navegador.
3. No formulário **Criar conta**, preencha todos os campos obrigatórios (nome, e-mail válido, CPF com 11 dígitos, telefone e senha com 8+ caracteres) e clique em **Cadastrar**.
4. Confirme o alerta de sucesso e verifique se ocorre o redirecionamento automático para `feed.html` já autenticado.
5. Abra uma nova aba anônima e repita o processo, mas agora use o bloco **Já tenho conta** para informar o e-mail/senha cadastrados. Ao prosseguir, você deve ser levado ao feed.
6. Para garantir o logout, visite qualquer página com o botão “Sair” (por exemplo, `index.html` da camada RF), clique nele e confirme que o armazenamento `mg_currentUser` é limpo e o fluxo retorna à tela inicial.
