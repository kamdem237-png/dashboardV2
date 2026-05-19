import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Upload.css';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    console.log('handleChange:', { name, value, files });
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== SUBMIT START ===');
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.file) {
      console.error('ERROR: Veuillez sélectionner un fichier');
      setError('Veuillez sélectionner un fichier');
      setLoading(false);
      return;
    }

    console.log('FormData:', {
      user_id: user.user_id,
      titre: formData.titre,
      fileName: formData.file.name,
      fileSize: formData.file.size,
      fileType: formData.file.type
    });

    const data = new FormData();
    data.append('user_id', user.user_id);
    data.append('titre', formData.titre);
    data.append('file', formData.file);

    console.log('Sending request to: https://dashboard-etudiant.free.nf/api/upload.php');

    try {
      const response = await fetch('https://dashboard-etudiant.free.nf/api/upload.php', {
        method: 'POST',
        body: data
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const text = await response.text();
      console.log('RAW RESPONSE:', text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error('JSON PARSE ERROR:', err);
        throw new Error('Réponse PHP invalide');
      }
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'upload');
      }

      if (result.success && result.dashboard_id) {
        console.log('SUCCESS: Dashboard created with ID:', result.dashboard_id);
        setSuccess('Tableau de bord créé avec succès ! Redirection...');
        setTimeout(() => {
          console.log('Redirecting to:', `/dashboard/${result.dashboard_id}`);
          navigate(`/dashboard/${result.dashboard_id}`);
        }, 1500);
      } else {
        throw new Error(result.message || 'Erreur lors de la création du tableau de bord');
      }
    } catch (err) {
      console.error('ERROR:', err);
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
      console.log('=== SUBMIT END ===');
    }
  };

  return (
    <div className="upload-page fade-in">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Téléverser des fichiers</h1>
          <p>Importez vos données Excel ou CSV pour créer un tableau de bord</p>
        </div>

        <div className="upload-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="titre">Nom du tableau de bord</label>
              <input
                type="text"
                id="titre"
                name="titre"
                className="form-control"
                value={formData.titre}
                onChange={handleChange}
                required
                placeholder="Ex: Gestion des salles de classe RH"
              />
            </div>

            <div className="form-group">
              <label htmlFor="file">Fichier (Excel ou CSV)</label>
              <div className={`file-upload-area ${formData.file ? 'has-file' : ''}`}>
                <input
                  type="file"
                  id="file"
                  name="file"
                  className="form-control"
                  onChange={handleChange}
                  accept=".xlsx,.xls,.csv"
                  required
                />
                {formData.file && (
                  <div className="file-selected">
                    <i className="bi bi-file-earmark-excel"></i>
                    <span>{formData.file.name}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={(e) => {
                      e.stopPropagation();
                      console.log('Removing file');
                      setFormData({ ...formData, file: null });
                    }}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                )}
                <div className="file-upload-info">
                  <i className="bi bi-cloud-upload"></i>
                  <p>Glissez votre fichier ici ou cliquez pour sélectionner</p>
                  <small>Formats acceptés: .xlsx, .xls, .csv</small>
                </div>
              </div>
            </div>

            <div className="format-info">
              <h4>Format flexible du fichier :</h4>
              <p>L'application lit <strong>automatiquement toutes les colonnes</strong> présentes dans votre fichier Excel ou CSV. Aucun format strict n'est requis.</p>
              <div className="format-features">
                <div className="feature-item">
                  <i className="bi bi-check-circle text-success"></i>
                  <span>Lecture dynamique de toutes les colonnes</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle text-success"></i>
                  <span>Gestion automatique des doublons</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle text-success"></i>
                  <span>Support de multiples tableaux dans un même fichier</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-check-circle text-success"></i>
                  <span>Reconnaissance intelligente des colonnes (nom, salle, présence, absence, stage, travail, etc.)</span>
                </div>
              </div>
            </div>

            <div className="upload-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Téléverser et générer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
