// Controllers: tratam entrada/saída HTTP e validação básica (RF-02, RF-09, RF-08).

const documentService = require('../services/documentService');

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo foi enviado.' });
  }

  const { owner } = req.body;
  if (!owner) {
    return res.status(400).json({ erro: 'O campo owner é obrigatório.' });
  }

  const document = documentService.createDocument(req.file, owner);
  return res.status(201).json(document);
}

function listDocuments(req, res) {
  const documents = documentService.listDocuments();
  return res.status(200).json(documents);
}

function downloadDocument(req, res) {
  const document = documentService.getDocumentById(req.params.id);
  if (!document) {
    return res.status(404).json({ erro: 'Documento não encontrado.' });
  }

  return res.download(document.storagePath, document.originalName, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ erro: 'Falha ao ler o arquivo do documento.' });
    }
  });
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
