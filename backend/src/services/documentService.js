// Regras de negócio para criação, listagem e recuperação de documentos.

const documentRepository = require('../repositories/documentRepository');
const { createDocumentFromUpload } = require('./documentFactory');

function createDocument(file, owner) {
  const document = createDocumentFromUpload(file, owner);
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
