// Botão de download de um documento específico.

import { getDownloadUrl } from '../services/documentApi';

export default function DownloadButton({ documentId, fileName }) {
  return (
    <a className="download-link" href={getDownloadUrl(documentId)} download={fileName}>
      ⬇ Baixar
    </a>
  );
}
