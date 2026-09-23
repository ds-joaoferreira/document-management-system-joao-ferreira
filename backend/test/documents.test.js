const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const createdStoragePaths = [];

function startServer() {
  const server = app.listen(0);
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

// Use null (não undefined) para omitir file/owner: undefined aciona o valor padrão da desestruturação.
async function uploadFile(baseUrl, { fileName = 'teste.txt', content = 'conteúdo de teste', owner = 'user-001' } = {}) {
  const formData = new FormData();
  if (content !== null) {
    formData.append('file', new Blob([content]), fileName);
  }
  if (owner !== null) {
    formData.append('owner', owner);
  }

  return fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
}

after(() => {
  // Remove os arquivos físicos criados pelos testes de upload.
  for (const storagePath of createdStoragePaths) {
    fs.rmSync(storagePath, { force: true });
  }
});

test('POST /upload cria um documento e grava o arquivo em backend/storage', async () => {
  const { server, baseUrl } = startServer();

  try {
    const response = await uploadFile(baseUrl, { fileName: 'contrato.pdf', content: 'ola mundo' });
    assert.strictEqual(response.status, 201);

    const document = await response.json();
    createdStoragePaths.push(document.storagePath);

    assert.ok(document.id.startsWith('doc_'));
    assert.strictEqual(document.originalName, 'contrato.pdf');
    assert.strictEqual(document.owner, 'user-001');
    assert.ok(fs.existsSync(document.storagePath), 'o arquivo deve existir em backend/storage');
    assert.ok(document.storagePath.startsWith(STORAGE_DIR));
  } finally {
    server.close();
  }
});

test('POST /upload retorna 400 quando nenhum arquivo é enviado', async () => {
  const { server, baseUrl } = startServer();

  try {
    const response = await uploadFile(baseUrl, { content: null });
    assert.strictEqual(response.status, 400);

    const body = await response.json();
    assert.ok(body.erro);
  } finally {
    server.close();
  }
});

test('POST /upload retorna 400 quando o campo owner está ausente', async () => {
  const { server, baseUrl } = startServer();

  try {
    const response = await uploadFile(baseUrl, { owner: null });
    assert.strictEqual(response.status, 400);

    const body = await response.json();
    assert.ok(body.erro);
  } finally {
    server.close();
  }
});

test('GET /documents lista os documentos enviados', async () => {
  const { server, baseUrl } = startServer();

  try {
    const uploadResponse = await uploadFile(baseUrl, { fileName: 'relatorio.xlsx', content: 'dados' });
    const uploadedDocument = await uploadResponse.json();
    createdStoragePaths.push(uploadedDocument.storagePath);

    const response = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(response.status, 200);

    const documents = await response.json();
    assert.ok(Array.isArray(documents));
    assert.ok(documents.some((document) => document.id === uploadedDocument.id));
  } finally {
    server.close();
  }
});

test('GET /documents/:id/download baixa o conteúdo original do arquivo', async () => {
  const { server, baseUrl } = startServer();

  try {
    const fileContent = 'conteúdo do documento para download';
    const uploadResponse = await uploadFile(baseUrl, { fileName: 'download.txt', content: fileContent });
    const uploadedDocument = await uploadResponse.json();
    createdStoragePaths.push(uploadedDocument.storagePath);

    const response = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
    assert.strictEqual(response.status, 200);

    const downloadedContent = await response.text();
    assert.strictEqual(downloadedContent, fileContent);
  } finally {
    server.close();
  }
});

test('GET /documents/:id/download retorna 404 para um documento inexistente', async () => {
  const { server, baseUrl } = startServer();

  try {
    const response = await fetch(`${baseUrl}/documents/doc_inexistente/download`);
    assert.strictEqual(response.status, 404);

    const body = await response.json();
    assert.ok(body.erro);
  } finally {
    server.close();
  }
});
