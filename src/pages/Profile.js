import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const fd = new FormData();
    fd.append('user_id', user.user_id);
    fd.append('nom', formData.nom);
    fd.append('prenom', formData.prenom);
    fd.append('email', formData.email);
    if (formData.password) {
      fd.append('password', formData.password);
    }

    try {
      await axios.post('https://dashboard-etudiant.free.nf/api/update_profile.php', fd);
      setSuccess('Profil mis à jour avec succès !');
      updateUser({
        ...user,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      });
      setFormData({ ...formData, password: '' });
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page fade-in">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="bi bi-person-circle"></i>
          </div>
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles</p>
        </div>

        <div className="profile-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                className="form-control"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                className="form-control"
                value={formData.prenom}
                onChange={handleChange}
                required
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Nouveau mot de passe (optionnel)</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Laissez vide pour ne pas changer"
              />
              <small className="text-muted">
                Laissez ce champ vide si vous ne souhaitez pas modifier votre mot de passe
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="account-info">
          <div className="info-card">
            <div className="info-icon">
              <i className="bi bi-calendar"></i>
            </div>
            <div className="info-content">
              <h4>Membre depuis</h4>
              <p>{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <div className="info-content">
              <h4>Statut du compte</h4>
              <p>Actif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
