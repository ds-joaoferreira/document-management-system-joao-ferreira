// Fábrica de documentos: converte o arquivo do multer em uma entidade Documento.

const crypto = require('node:crypto');

function generateDocumentId() {
  return `doc_${crypto.randomUUID()}`;
}

function createDocumentFromUpload(file, owner) {
  return {
    id: generateDocumentId(),
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    contentType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    owner,
    storagePath: file.path,
  };
}

module.exports = {
  createDocumentFromUpload,
};
