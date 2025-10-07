# Requisitos Funcionais (RF)

Este documento lista os requisitos funcionais fornecidos, com critérios de aceitação e notas para implementação.

Resumo rápido
- Total de requisitos: 13
- Prioridade: Todos de prioridade Alta

Requisitos

## RF001 — Criação de conta
- Descrição: O sistema deve permitir que o usuário crie uma conta. No cadastro, o usuário deve informar dados básicos como nome, e-mail e senha, tipo, localização (CEP, número, cidade, rua e bairro) e telefone.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF003, RF004, RF005, RF008, RF009, RF011
- Critérios de aceitação:
  - Formulário de cadastro com campos: nome, e-mail, senha (com confirmação), tipo (ex: músico, contratante), CEP, número, cidade, rua, bairro, telefone.
  - Validação de e-mail bem formado; senha com política mínima (ex: 8 caracteres).
  - Armazenamento seguro da senha (hash) — nota: responsabilidade do backend.
  - Mensagem de sucesso e fluxo de verificação (opcional: verificação de e-mail).

## RF002 — Login
- Descrição: O sistema deve permitir que o usuário entre na sua conta informando os dados cadastrados (apenas e-mail e senha).
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF001, RF004
- Critérios de aceitação:
  - Página/endpoint de login que aceita e-mail e senha.
  - Autenticação com tokens de sessão/JWT (definir no backend).
  - Mensagem de erro em credenciais inválidas.

## RF003 — Edição de perfil
- Descrição: O sistema deve permitir que a pessoa edite as informações do seu perfil, como nome, foto, contato e uma pequena descrição sobre si mesma.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF001, RF004, RF008
- Critérios de aceitação:
  - Página de edição com campos: nome, foto (upload), contato (telefone, e-mail), descrição (bio).
  - Preview da foto e confirmação de upload.
  - Mudanças persistidas e refletidas no perfil público.

## RF004 — Portfólio
- Descrição: O sistema deve permitir que a pessoa adicione ou edite seu portfólio, colocando fotos, vídeos ou descrições de shows, trabalhos ou eventos já realizados.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF001, RF003, RF005
- Critérios de aceitação:
  - Interface para criar itens de portfólio com mídia (fotos, vídeos, texto).
  - Upload para storage (backend) e exibição nas páginas de perfil e feed.
  - Edição e remoção de itens de portfólio.

## RF005 — Feed de publicações
- Descrição: O sistema deve permitir que o músico veja, em uma página inicial (feed), as publicações feitas por outros usuários, como portfólios, fotos ou vídeos, podendo curtir e comentar nelas.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF004, RF008
- Critérios de aceitação:
  - Feed paginado/ordenado (ex: mais recente / mais relevantes).
  - Cada publicação mostra autor, mídia, número de curtidas e comentários.
  - Botões de curtir e comentar funcionando no frontend, chamando APIs.

## RF006 — Curtir publicações
- Descrição: O sistema deve permitir que o músico curta publicações feitas por outros usuários. A curtida deve ser registrada e exibida junto da publicação, podendo ser removida caso o usuário desfaça a ação.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF005, RF007
- Critérios de aceitação:
  - Ao curtir, contador na publicação incrementa e armazena relação usuário-publicação.
  - Ao descurtir, contador decrementa e relação é removida.

## RF007 — Comentar publicações
- Descrição: O sistema deve permitir que o músico comente publicações de outros usuários. O comentário ficará visível na publicação, junto do nome do autor, e poderá ser apagado ou editado pelo próprio usuário que o fez.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF005, RF006
- Critérios de aceitação:
  - Comentários exibem autor, conteúdo e data/hora.
  - Usuário pode editar/apagar apenas seus próprios comentários.

## RF008 — Pedidos de conexão
- Descrição: O sistema deve permitir que a pessoa envie pedidos de conexão (amizade) para outros usuários.
- Prioridade: Alta
- Tipo: Funcional
- Critérios de aceitação:
  - Botão "Conectar" no perfil de outros usuários gera uma solicitação enviada.
  - Estado da solicitação visível (pendente/enviado).

## RF009 — Aceitar/Recusar pedidos
- Descrição: O sistema deve permitir que a pessoa aceite ou recuse pedidos de conexão recebidos de outros usuários.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF008, RF010
- Critérios de aceitação:
  - Lista de solicitações recebidas com ações Aceitar/Recusar.
  - Aceitar cria relação de amizade/conexão; recusar remove a solicitação.

## RF010 — Mensagens privadas
- Descrição: O sistema deve permitir que a pessoa troque mensagens com seus amigos dentro da plataforma, de forma simples e direta, como em uma conversa, após aceita a conexão, mas também deve autorizar o envio de uma mensagem para outro usuário não conectado, que vai ser feito através de uma solicitação.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF009
- Critérios de aceitação:
  - Conversas privadas entre usuários conectados.
  - Envio de mensagem para não-conectados gera uma solicitação (preview + permissão do destinatário).
  - Histórico de conversas armazenado e recuperável.

## RF011 — Sugestão de amigos
- Descrição: O sistema deve sugerir novos amigos para a pessoa, de acordo com o que ela colocou no cadastro e com quem ela já se conectou.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF001, RF006
- Critérios de aceitação:
  - Sistema exibe sugestões baseadas em interesses, tipo e conexões em comum.

## RF012 — Denúncia de conteúdo
- Descrição: O sistema deve permitir que o usuário denuncie publicações ou perfis que contenham conteúdo ofensivo, falso ou que violem as regras.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF003, RF004, RF005, RF006, RF007, RF008
- Critérios de aceitação:
  - Botão/ação de denunciar em publicações e perfis.
  - Coleta motivo e evidências (opcional).

## RF013 — Sinalização para moderação
- Descrição: Quando o músico tiver feito a denúncia, o conteúdo ficará sinalizado para que os moderadores analisem.
- Prioridade: Alta
- Tipo: Funcional
- Relaciona-se com: RF012
- Critérios de aceitação:
  - Conteúdo denunciado recebe flag de moderação e entra em fila para análise por moderadores.

---

Contrato mínimo (entrada/saída, erros):
- Entrada: dados do usuário (formulários), uploads de mídia, ações do usuário (curtir, comentar, conectar, denunciar).
- Saída: confirmação das ações, dados persistidos (perfil, portfólio, publicações), tokens de sessão.
- Erros esperados: campos inválidos, mídia muito grande, credenciais inválidas, limite de taxa em APIs.

Casos de borda importantes:
- Cadastro com e-mail já registrado.
- Upload de mídia muito grande ou tipo não suportado.
- Ações concorrentes (duas curtidas simultâneas).
- Mensagens enviadas para usuários que bloquearam o remetente.

Sugestões de próximos passos implementáveis (posso fazer):
- Gerar wireframes para telas de cadastro/login/perfil/feed.
- Criar endpoints REST mock (JSON) para testes frontend.
- Implementar formulário de cadastro e login no frontend (HTML/JS) integrando com `login.js`.

---

Arquivo gerado automaticamente por solicitação do cliente.
