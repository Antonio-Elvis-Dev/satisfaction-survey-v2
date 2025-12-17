# 🧩 Documento de Especificação — Backend
Projeto: Satisfaction Survey API
Versão: 1.0
Responsáveis:

Antônio Elvis Pinheiro — Desenvolvedor Backend

# 🎯 Objetivo do Sistema

O sistema tem como objetivo gerenciar e aplicar pesquisas de satisfação (surveys) para usuários cadastrados, permitindo a criação de formulários, envio aos participantes, coleta de respostas e geração de métricas consolidadas.

# ⚙️ Requisitos Funcionais (RF)
# 🧑‍💻 Módulo de Usuários

[X] RF01. O sistema deve permitir o registro de usuários com os campos: email, password, e opcionalmente profile.
[X] RF02. O sistema deve criptografar a senha antes de salvar no banco de dados.
[ ] RF03. O sistema deve permitir o login de usuários com email e password, retornando um token JWT.
[ ] RF04. O sistema deve permitir que o usuário visualize e edite seu perfil, incluindo nome, cargo, e departamento.
[ ] RF05. O sistema deve permitir que administradores visualizem a lista completa de usuários.
[ ] RF06. O sistema deve permitir que administradores atribuam papéis (roles) aos usuários (admin, manager, viewer).
[ ] RF07. O sistema deve permitir que administradores criem e removam usuários.

# 🧾 Módulo de Papéis e Permissões

[ ] RF08. O sistema deve validar permissões em cada rota protegida, garantindo que apenas usuários com o papel adequado executem certas ações.
[ ] RF09. O sistema deve registrar quem criou cada papel (createdById), conforme o relacionamento UserRolesCreatedBy.

# 📋 Módulo de Pesquisas (Surveys)

[ ] RF10. O sistema deve permitir que usuários com papel admin ou manager criem novas pesquisas de satisfação.
[ ] RF11. Cada pesquisa deve conter título, descrição e data de validade.
[ ] RF12. O sistema deve permitir adicionar perguntas a uma pesquisa, com tipos variados (texto, múltipla escolha, escala de 1 a 5).
[ ] RF13. O sistema deve permitir editar e excluir pesquisas, desde que ainda não estejam em andamento.
[ ] RF14. O sistema deve permitir que usuários respondam às pesquisas ativas a que foram convidados.
[ ] RF15. O sistema deve registrar uma sessão de resposta (ResponseSession) com o usuário, survey e timestamp.
[ ] RF16. O sistema deve permitir que um mesmo usuário responda apenas uma vez por pesquisa.
[ ] RF17. O sistema deve permitir que administradores visualizem todas as respostas enviadas.

# 📊 Módulo de Métricas e Relatórios

[ ] RF18. O sistema deve calcular automaticamente a média de satisfação de cada pesquisa.
[ ] RF19. O sistema deve permitir consultar o histórico de respostas de um usuário.
[ ] RF20. O sistema deve permitir gerar relatórios de desempenho (por departamento, período, etc.).

# 🔒 Módulo de Autenticação e Autorização

[ ] RF21. O sistema deve implementar autenticação via JWT com tokens de acesso e refresh.
[ ] RF22. O sistema deve oferecer uma rota /refresh-token para gerar novos tokens sem precisar logar novamente.
[ ] RF23. O sistema deve bloquear rotas sensíveis para usuários não autenticados.
[ ] RF24. O sistema deve verificar permissões de acordo com o papel do usuário via middleware (verify-user-role).

# 🧠 Regras de Negócio (RN)

[ ] RN01. Um usuário pode possuir apenas um papel ativo por vez, definido em users_roles.
[ ] RN02. Apenas usuários com papel admin podem criar ou remover outros usuários.
[ ] RN03. Apenas usuários com papel manager ou admin podem criar novas pesquisas.
[ ] RN04. Pesquisas encerradas (dataFim < data atual) não podem mais receber respostas.
[ ] RN05. Um usuário não pode editar uma pesquisa já iniciada (status: “ativa”).
[ ] RN06. Cada resposta submetida deve pertencer a uma sessão única vinculada a um usuário e pesquisa.
[ ] RN07. Todas as ações críticas (criação, exclusão, atribuição de papéis) devem ser registradas em logs de auditoria.
[ ] RN08. Um ResponseSession só pode existir se o userId e surveyId forem válidos.
[ ] RN09. Caso o JWT_SECRET ou variáveis do ambiente estejam inválidas, o servidor não deve iniciar.

# 🧰 Requisitos Não Funcionais (RNF)

[ ] RNF01. O backend deve ser implementado em Node.js com Fastify.
[ ] RNF02. O sistema deve utilizar Prisma ORM com banco PostgreSQL.
[ ] RNF03. O sistema deve seguir Clean Architecture, separando:

controllers → HTTP layer

use-cases → regras de negócio

repositories → persistência de dados

lib/prisma.ts → instância do Prisma
[ ] RNF04. O sistema deve validar variáveis de ambiente com Zod, abortando execução em caso de falha.
[ ] RNF05. O sistema deve seguir padrão RESTful em todas as rotas.
[ ] RNF06. O código deve ser escrito em TypeScript com tipagem forte e tsconfig estrito.
[ ] RNF07. O sistema deve utilizar JWT com tempo de expiração configurável via .env.
[ ] RNF08. O projeto deve conter testes unitários e de integração com Vitest e mocks in-memory.
[ ] RNF09. O sistema deve ter tratamento centralizado de erros (ex: InvalidCredentialsError, ForbiddenError).
[ ] RNF10. As respostas da API devem estar em JSON padronizado, incluindo mensagens e códigos HTTP corretos.
[ ] RNF11. O backend deve ser containerizado com Docker, expondo porta definida no .env (PORT).
[ ] RNF12. O servidor deve registrar logs de requisições e erros no console e/ou arquivo.