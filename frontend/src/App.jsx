import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { fetchDocuments } from './services/documentApi';

const DEFAULT_OWNER = 'user-001';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  function handleUploaded(document) {
    setDocuments((current) => [...current, document]);
  }

  return (
    <>
      <header className="app-header">
        <h1 className="app-header__title">Document Management System</h1>
      </header>
      <main className="app-container">
        <section>
          <h2 className="section-title">Enviar documento</h2>
          <UploadComponent owner={DEFAULT_OWNER} onUploaded={handleUploaded} />
        </section>
        <section>
          <h2 className="section-title">Documentos</h2>
          <DocumentList documents={documents} isLoading={isLoading} error={error} />
        </section>
      </main>
    </>
  );
}
