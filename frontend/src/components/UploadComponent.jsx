// Componente de envio de um novo documento.

import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ owner, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const document = await uploadDocument(file, owner);
      setFile(null);
      event.target.reset();
      onUploaded(document);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-card upload-form" onSubmit={handleSubmit}>
      <label className="upload-form__file-label">
        {file ? file.name : 'Escolher arquivo...'}
        <input
          className="upload-form__file-input"
          type="file"
          onChange={(event) => setFile(event.target.files[0] ?? null)}
        />
      </label>
      <button className="button button--primary" type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <p className="alert" role="alert">{error}</p>}
    </form>
  );
}
