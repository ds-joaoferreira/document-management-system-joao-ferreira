# Especificação do Document Management System (DMS)

## 1. Objetivo

O sistema deve permitir que usuários registrem documentos locais em uma aplicação web, visualizem os metadados dos arquivos enviados e façam download do conteúdo original, mantendo a persistência de arquivos no filesystem local da aplicação e os metadados em memória durante esta fase inicial.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos por usuário
- Download de documentos por identificador
- Gestão simples de documentos por usuário
- Persistência local dos arquivos em `backend/storage`
- Disponibilização de endpoints HTTP para integração com frontend
- Tratamento básico de erros de entrada e leitura/escrita de arquivos

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Controle avançado de permissões
- Autenticação e autorização complexa
- Compartilhamento público de arquivos
- Pesquisa textual em conteúdo de arquivos
- Cópia de segurança automatizada
- Preservação de histórico de alterações
- Integração com serviços de terceiros

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve permitir o envio de um arquivo por meio de formulário multipart. |
| RF-02 | O sistema deve validar que o arquivo foi enviado corretamente antes de gravá-lo. |
| RF-03 | O sistema deve gerar um identificador único para cada documento enviado. |
| RF-04 | O sistema deve registrar o nome original do arquivo, tamanho, data de upload e identificador do proprietário. |
| RF-05 | O sistema deve persistir o arquivo no filesystem local da aplicação, em uma pasta específica de armazenamento. |
| RF-06 | O sistema deve listar todos os documentos disponíveis para o usuário ou para o sistema no contexto atual. |
| RF-07 | O sistema deve permitir a recuperação do documento por identificador para download. |
| RF-08 | O sistema deve devolver erros claros quando o documento solicitado não existir. |
| RF-09 | O sistema deve impedir o processamento de uploads vazios ou inválidos. |
| RF-10 | O sistema deve preservar o nome original do arquivo para apresentação ao usuário. |
| RF-11 | O sistema deve manter os metadados em memória nesta fase, sem persistência em banco de dados. |
| RF-12 | O sistema deve permitir que o frontend visualize a lista de documentos com metadados suficientes para identificação e download. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos enviados devem ser gravados no filesystem local da aplicação, usando `multer` com `diskStorage`. |
| RNF-02 | Os metadados dos documentos devem ser mantidos em memória nesta fase de desenvolvimento. |
| RNF-03 | A configuração da aplicação deve ser feita via variáveis de ambiente, seguindo o princípio 12-Factor. |
| RNF-04 | O backend deve seguir Clean Architecture simples, separando responsabilidades em camadas: `routes`, `controllers`, `services` e `repositories`. |
| RNF-05 | O frontend deve ser implementado com React e componentes funcionais, utilizando `fetch` para comunicação via prefixo `/api`. |
| RNF-06 | O sistema deve tratar falhas de leitura, escrita e entrada HTTP com respostas adequadas ao cliente. |
| RNF-07 | O código deve manter simplicidade, clareza e baixa complexidade de manutenção. |
| RNF-08 | O sistema deve operar em ambiente local, sem depender de provedores externos de armazenamento. |

## 5. Modelo de dados

### Entidade principal: Documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único do documento, gerado no momento do upload. |
| `originalName` | string | Sim | Nome original do arquivo enviado pelo usuário. |
| `storedName` | string | Sim | Nome do arquivo gravado no filesystem local, usado para identificar o arquivo em disco. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `contentType` | string | Não | Tipo mime do arquivo, quando disponível. |
| `uploadedAt` | string | Sim | Data e hora do upload em formato ISO 8601. |
| `owner` | string | Sim | Identificador do usuário dono do documento. |
| `storagePath` | string | Sim | Caminho local do arquivo no filesystem da aplicação. |

### Observações do modelo

- O modelo de dados é simples e focado em metadados essenciais para operação do sistema.
- Não existe banco de dados nesta fase; a lista de documentos fica em memória no processo da aplicação.
- O arquivo físico permanece no `backend/storage`, enquanto os metadados são mantidos em memória em uma estrutura de coleção.
- O atributo `owner` permite que o sistema evolua para gestão por usuário sem mudar a estrutura básica do documento.

## 6. Contratos de API

### Prefixo da API

O frontend deve consumir o backend via prefixo `/api`, conforme padrão do projeto. Em uma implementação final, o prefixo pode ser montado no servidor conforme a configuração do proxy do Vite.

### 6.1 POST /api/upload

#### Objetivo

Enviar um arquivo e criar um novo documento.

#### Método

`POST`

#### Content-Type

`multipart/form-data`

#### Parâmetros de entrada

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `file` | Arquivo | Sim | Arquivo a ser enviado. |
| `owner` | string | Sim | Identificador do usuário dono do documento. |

#### Fluxo esperado

1. O cliente envia o arquivo em formulário multipart.
2. O backend valida a presença do arquivo.
3. O backend grava o arquivo no filesystem local.
4. O backend cria um registro em memória com os metadados do documento.
5. O backend retorna o documento criado.

#### Resposta de sucesso - 201 Created

```json
{
  "id": "doc_01JZ9G7E8A5P4N7K8R2M",
  "originalName": "contrato.pdf",
  "storedName": "contrato-2026-09-23-171530.pdf",
  "size": 245678,
  "contentType": "application/pdf",
  "uploadedAt": "2026-09-23T17:15:30.000Z",
  "owner": "user-001",
  "storagePath": "/app/backend/storage/contrato-2026-09-23-171530.pdf"
}
```

#### Possíveis erros

- `400 Bad Request` quando o arquivo não vier no payload.
- `415 Unsupported Media Type` quando o tipo de arquivo não for aceito pelo backend.
- `500 Internal Server Error` em falhas de gravação local.

### 6.2 GET /api/documents

#### Objetivo

Listar documentos disponíveis no sistema.

#### Método

`GET`

#### Resposta de sucesso - 200 OK

```json
[
  {
    "id": "doc_01JZ9G7E8A5P4N7K8R2M",
    "originalName": "contrato.pdf",
    "storedName": "contrato-2026-09-23-171530.pdf",
    "size": 245678,
    "contentType": "application/pdf",
    "uploadedAt": "2026-09-23T17:15:30.000Z",
    "owner": "user-001",
    "storagePath": "/app/backend/storage/contrato-2026-09-23-171530.pdf"
  },
  {
    "id": "doc_01JZ9G7E8A5P4N7K8R2N",
    "originalName": "relatorio.xlsx",
    "storedName": "relatorio-2026-09-23-172010.xlsx",
    "size": 124500,
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "uploadedAt": "2026-09-23T17:20:10.000Z",
    "owner": "user-001",
    "storagePath": "/app/backend/storage/relatorio-2026-09-23-172010.xlsx"
  }
]
```

#### Possíveis erros

- `500 Internal Server Error` quando não for possível consultar a lista em memória.

### 6.3 GET /api/documents/:id/download

#### Objetivo

Baixar o conteúdo binário do arquivo de um documento específico.

#### Método

`GET`

#### Parâmetros de rota

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único do documento. |

#### Resposta de sucesso - 200 OK

- Cabeçalho `Content-Type` apropriado ao tipo do arquivo.
- Corpo contendo o conteúdo binário do documento.
- Possível uso de `Content-Disposition: attachment; filename="nome-original.ext"`.

#### Exemplo de resposta binária

```text
%PDF-1.4
...
```

#### Possíveis erros

- `404 Not Found` quando o documento não existir.
- `500 Internal Server Error` quando ocorrer falha na leitura do arquivo do disco.

### 6.4 GET /api/documents/:id

#### Objetivo

Recuperar os metadados de um documento específico.

#### Método

`GET`

#### Resposta de sucesso - 200 OK

```json
{
  "id": "doc_01JZ9G7E8A5P4N7K8R2M",
  "originalName": "contrato.pdf",
  "storedName": "contrato-2026-09-23-171530.pdf",
  "size": 245678,
  "contentType": "application/pdf",
  "uploadedAt": "2026-09-23T17:15:30.000Z",
  "owner": "user-001",
  "storagePath": "/app/backend/storage/contrato-2026-09-23-171530.pdf"
}
```

> Esta rota é opcional para o exercício, mas representa uma extensão natural do modelo de dados e facilita a navegação no frontend e a validação de arquivos existentes.

## 7. Decisões arquiteturais

### 7.1 Arquitetura do backend

A aplicação deve seguir uma estrutura simples de Clean Architecture com separação clara de responsabilidades:

- `routes/`: definem endpoints HTTP e delegam a execução aos controllers.
- `controllers/`: recebimento da requisição, extração de dados da entrada e retorno adequado ao cliente.
- `services/`: concentram as regras de negócio, como validação de upload, geração de identificadores e associação de metadados.
- `repositories/`: gerenciam a persistência dos dados em memória e, eventualmente, a leitura/escrita em disco.

Fluxo de dependência: `routes -> controllers -> services -> repositories`.

### 7.2 Persistência de arquivos

- Os arquivos físicos devem ser salvos em `backend/storage`.
- O uso de `multer` com `diskStorage` é obrigatório para garantir persistência local e compatibilidade com upload multipart.
- A estratégia deve preservar o nome original do usuário para exibição e gerar um nome de arquivo de armazenamento único para evitar conflitos.

### 7.3 Persistência de metadados

- Os metadados devem ficar em memória em uma estrutura simples, como um array ou mapa keyed by id.
- Não deve haver banco de dados neste momento.
- A solução é adequada para a fase inicial do exercício e para demonstrar arquitetura e fluxo funcional.

### 7.4 Frontend

- O frontend deve ser criado com React utilizando componentes funcionais e hooks.
- A comunicação com o backend deve ser feita com `fetch`.
- Os endpoints devem ser consumidos com prefixo `/api` para seguir a convenção do projeto e do proxy do Vite.

## 8. Plano de execução em etapas

A implementação deve seguir uma ordem lógica, priorizando a base estrutural antes da experiência de usuário.

### Etapa 1 - Definição da arquitetura base

- Confirmar a separação em camadas de backend.
- Organizar a estrutura do projeto em `routes`, `controllers`, `services` e `repositories`.
- Definir a política de armazenamento local e os caminhos de persistência.
- Validar o uso de variáveis de ambiente para configuração da aplicação.

### Etapa 2 - Preparação do armazenamento local

- Criar a pasta de armazenamento local para arquivos.
- Configurar `multer` com `diskStorage`.
- Definir estratégia para nomes únicos de arquivos e controle de conflitos.
- Validar a gravação local com arquivos de teste simples.

### Etapa 3 - Modelagem dos metadados e da memória

- Definir a estrutura dos metadados do documento.
- Criar o repositório de metadados em memória.
- Garantir que o documento tenha identificador único, nome original, tamanho, data e dono.
- Definir operações básicas de criação, listagem e consulta por identificador.

### Etapa 4 - Implementação dos casos de uso do backend

- Implementar o fluxo de upload com validação básica.
- Implementar a listagem de documentos.
- Implementar a recuperação de um documento por identificador.
- Implementar o download do arquivo físico associado.
- Tratar erros de entrada e de leitura/escrita com respostas HTTP adequadas.

### Etapa 5 - Definição da interface do frontend

- Estruturar a página principal para upload e listagem.
- Criar componentes reutilizáveis para exibição de documentos.
- Conectar a UI com os endpoints expostos no backend.
- Exibir estados de carregamento, sucesso e falha de forma simples.

### Etapa 6 - Validação funcional do fluxo completo

- Testar upload de um arquivo válido.
- Verificar se o item aparece na listagem.
- Confirmar a operação de download.
- Validar erros para arquivo ausente, inexistente ou inválido.
- Validar o comportamento em ambiente local sem depender de serviços externos.

### Etapa 7 - Refinamento e documentação final

- Revisar os nomes e respostas dos endpoints.
- Confirmar que a arquitetura está coerente com Clean Architecture.
- Documentar decisões de persistência e regras de negócio.
- Preparar a base para evoluções futuras, como autenticação e persistência externa.

## 9. Critérios de aceite

1. O usuário consegue enviar um arquivo pela interface e o documento é registrado no sistema.
2. O arquivo é salvo no filesystem local da aplicação em `backend/storage`.
3. Os metadados do documento são retornados em resposta ao upload e na listagem.
4. O usuário consegue visualizar a lista de documentos disponíveis.
5. O usuário consegue baixar um arquivo previamente enviado.
6. O sistema retorna erro claro quando o arquivo não existir ou o payload estiver inválido.
7. A implementação respeita a separação em camadas e a simplicidade da arquitetura proposta.
8. O sistema não depende de serviços externos de armazenamento.

## 10. Resumo executivo

Este projeto tem como objetivo demonstrar a criação de um sistema simples de gestão documental com foco em upload, listagem e download de arquivos, preservando a regra principal de armazenamento local. A solução adota uma arquitetura leve em camadas no backend, com frontend em React, e mantém os dados em memória para facilitar a fase inicial de desenvolvimento. O resultado é um sistema funcional, compreensível e alinhado ao escopo didático do exercício.
