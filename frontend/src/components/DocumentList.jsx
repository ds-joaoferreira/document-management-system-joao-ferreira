// Lista de documentos disponíveis, com opção de download por item.

import DownloadButton from './DownloadButton';

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default function DocumentList({ documents, isLoading, error }) {
  if (isLoading) {
    return (
      <p className="status-message">
        <span className="spinner" aria-hidden="true" />
        Carregando documentos...
      </p>
    );
  }

  if (error) {
    return <p className="alert" role="alert">{error}</p>;
  }

  if (documents.length === 0) {
    return <p className="document-table__empty">Nenhum documento enviado ainda.</p>;
  }

  return (
    <table className="document-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho</th>
          <th>Enviado em</th>
          <th>Proprietário</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>{document.originalName}</td>
            <td>{formatFileSize(document.size)}</td>
            <td>{new Date(document.uploadedAt).toLocaleString('pt-BR')}</td>
            <td>{document.owner}</td>
            <td>
              <DownloadButton documentId={document.id} fileName={document.originalName} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
