// Repositório de documentos: mantém os metadados em memória (RF-11).

const documents = [];

function add(document) {
  documents.push(document);
  return document;
}

function findAll() {
  return documents;
}

function findById(id) {
  return documents.find((document) => document.id === id);
}

module.exports = {
  add,
  findAll,
  findById,
};
