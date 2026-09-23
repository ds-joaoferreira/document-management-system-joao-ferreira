// Regras de negócio para criação, listagem e recuperação de documentos.

const crypto = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

function createDocument(file, owner) {
  const document = {
    id: `doc_${crypto.randomUUID()}`,
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    contentType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    owner,
    storagePath: file.path,
  };

  return documentRepository.add(document);
}

function listDocuments() {
  return documentRepository.findAll();
}

function getDocumentById(id) {
  return documentRepository.findById(id);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentById,
};
